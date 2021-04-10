import React from "react";
import { Grid } from "@material-ui/core";
import { encode, decode } from "@digitalbazaar/cborld";
import { QR } from "@bloomprotocol/qr-react";
import QrReader from "react-qr-reader";

import { documentLoader } from "./documentLoader";

import base32Encode from "base32-encode";
import base32Decode from "base32-decode";

const jsonldDocument = {
  "@context": ["https://www.w3.org/ns/did/v1"],
  id: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
};

const jsonLdToBase32CborLd = async (json) => {
  const cborldBytes = await encode({ jsonldDocument: json, documentLoader });
  const base32EncodedCborLd = base32Encode(cborldBytes, "RFC4648").replace(
    /=/g,
    ""
  );
  return base32EncodedCborLd;
};

const base32CborLdToJson = async (base32EncodedCborLd) => {
  const decodedCborLdBytes = Uint8Array.from(
    Buffer.from(base32Decode(base32EncodedCborLd, "RFC4648"))
  );
  const decodedCborLd = await decode({
    cborldBytes: decodedCborLdBytes,
    documentLoader,
  });
  return decodedCborLd;
};

function App() {
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
            logo={{ image: "/logo192.png" }}
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
}

export default App;
