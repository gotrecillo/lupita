import multer from 'multer';
import multerS3 from 'multer-s3';
import nextConnect from 'next-connect';
import aws from "aws-sdk";
import {Textract} from "@aws-sdk/client-textract";


export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

const s3 = new aws.S3({ region: 'eu-west-3' });

const apiRoute = nextConnect({
    onError(error, req, res) {
        res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});

const upload = multer({
    limits: {
        // Max file size (5 mb)
        fileSize: 1024 * 1024 * 5,
    },
    storage: multerS3({
        s3: s3,
        bucket: 'cositasalcanal',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            req.s3Filename = Date.now().toString();
            cb(null, req.s3Filename)
        },

    })
})


const textTractMiddleware = async (req, res, next) => {
    const textParams = {
        Document: {
            S3Object: {
                Bucket: "cositasalcanal",
                Name: req.s3Filename,
            }
        },
    }

    const textTract = new Textract({ region: 'eu-west-3'});
    let textTractData;
    try {
        textTractData = await textTract.analyzeExpense(textParams);
    } catch (e) {
        textTractData = e;
    }


    req.textTractData = textTractData;
    // req.normalizedData = normalizeTextTractData(textTractData);
    next();
};


const normalizeTextTractData = (textTractData) => {
    const rawLines = textTractData.ExpenseDocuments[0].LineItemGroups[0].LineItems;
    const rawSummary = textTractData.ExpenseDocuments[0].SummaryFields;
    const lines = rawLines.map(line => ({
        fields: line.LineItemExpenseFields.map(field =>
            ({
                type: field?.Type?.Text,
                value: field?.ValueDetection?.Text,
                label: field?.LabelDetection?.Text
            })),
    }));
    const summary = rawSummary.map(line => ({
        type: line?.Type?.Text,
        value: line?.ValueDetection?.Text,
        label: line?.LabelDetection?.Text
    }));
    return  {
        lines,
        summary,
    }
}

apiRoute.use(upload.single('image'));
apiRoute.use(textTractMiddleware);

apiRoute.post((req, res) => {
    res.status(200).json({ data: req.normalizedData, raw: req.textTractData });
});


export default apiRoute;
