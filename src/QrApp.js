import React from "react";
import { Grid } from "@material-ui/core";
import { QR } from "@bloomprotocol/qr-react";
import QrReader from "react-qr-reader";

import {
  jsonldDocument,
  jsonLdToBase32CborLd,
  base32CborLdToJson,
} from "./common";

export const QrApp = () => {
  const [state, setState] = React.useState({});

  React.useEffect(() => {
    if (!state.base32EncodedCborLd) {
      (async () => {
        const base32EncodedCborLd = await jsonLdToBase32CborLd(jsonldDocument);
        // const decodedCborLd = await base32CborLdToJson(base32EncodedCborLd);
        setState({
          jsonldDocument,
          base32EncodedCborLd,
          // scannedQrCode: decodedCborLd,
        });
      })();
    }
  });

  const handleScan = async (data) => {
    if (data) {
      setState({
        ...state,
        scannedQrCode: await base32CborLdToJson(data),
      });
    }
  };

  let blockSize = 512;
  return (
    <div className="App">
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <h3>CBOR-LD</h3>
          <p>
            {!state.scannedQrCode
              ? "Use a mirror to scan the QR Code."
              : "Decoded CBOR-LD."}
          </p>
        </Grid>
        {!state.scannedQrCode && (
          <Grid item xs={12} sm={6}>
            <QrReader
              delay={300}
              onScan={handleScan}
              onError={(e) => {
                console.error(e);
              }}
              style={{ maxWidth: `${blockSize}px` }}
            />
          </Grid>
        )}
        <Grid item sm={6}>
          <QR
            data={state.base32EncodedCborLd || ""}
            logo={{ image: window.location + "/logo192.png" }}
            fgColor={"#594aa8"}
            height={blockSize}
            width={blockSize}
            ecLevel={"M"}
          />
        </Grid>
        {state.scannedQrCode && (
          <Grid item sm={6}>
            <pre>{JSON.stringify(state.scannedQrCode, null, 2)}</pre>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
