import Head from 'next/head'
import { useState } from 'react';
import axios from 'axios';

import styles from '../styles/Home.module.css'
import {UiFileInputButton} from "../components/UiFileInputButton";


const config = {
    headers: { 'content-type': 'multipart/form-data' },
};

const getVendor = data => {
    const field = {}
    // const field = data.data.summary.find(line => line.type == 'VENDOR_NAME') || {};
    return field.value || 'No detectado';
}

const getDate = data => {
    const field = {}
    // const field = data.data.summary.find(line => line.type == 'INVOICE_RECEIPT_DATE') || {};
    return field.value || 'No detectado';
}

const getTotal = data => {
    const field = {}
    // const field = data.data.summary.find(line => line.type == 'TOTAL') || {};
    return field.value || 'No detectado';
}

const getInvoiceId = data => {
    const field = {}
    // const field = data.data.summary.find(line => line.type == 'INVOICE_RECEIPT_ID') || {};
    return field.value || 'No detectado';
}

export default function Home() {
    const [src, setSrc] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const onChange = async (formData) => {
        setLoading(true);
        setData(null);
        setSrc('');
        const reader = new FileReader();
        reader.onloadend = function() {
            setSrc(reader.result);
        }
        reader.readAsDataURL(formData.get('image'));

        const response = await axios.post('/api/upload-file', formData, config);
        setLoading(false);
        setData(response.data);
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <UiFileInputButton
                      label="Subir imagen"
                      uploadFileName="image"
                      onChange={onChange}
                />
                {loading && <p>Loading...</p>}
                {!loading && src && <div className={styles.image}><img src={src} alt="ticket"/></div>}
                {data &&
                    (<>
                        <p>Nombre fiscal: {getVendor(data)}</p>
                        <p>Fecha factura: {getDate(data)}</p>
                        <p>Total: {getTotal(data)}</p>
                        <p>Numero factura: {getInvoiceId(data)}</p>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </>)
                }
            </main>

        </div>
    )
}
