import React from "react";
import { Grid, Button } from "@material-ui/core";

import {
  jsonldDocument,
  jsonLdToBase32CborLd,
  base32CborLdToJson,
  buf2hex,
} from "./common";

export const NfcApp = () => {
  const [state, setState] = React.useState({});

  React.useEffect(() => {
    if (!state.base32EncodedCborLd) {
      (async () => {
        const base32EncodedCborLd = await jsonLdToBase32CborLd(jsonldDocument);
        // const decodedCborLd = await base32CborLdToJson(base32EncodedCborLd);
        setState({
          ...state,
          jsonldDocument,
          base32EncodedCborLd,
          // readFromTag: decodedCborLd,
        });
      })();
    }
  });

  return (
    <div className="App">
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <h3>Web NFC</h3>
          <p>Web NFC is not supported by Apple.</p>
          <p>
            {!state.readFromTag
              ? "Click Write and hold an NDEF compatible NFC Tag next to your phone."
              : "Decoded CBOR-LD from NFC Tag using Web NFC!"}
          </p>
        </Grid>
        {!state.readFromTag && (
          <Grid item xs={12} sm={6}>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={async () => {
                if ("NDEFReader" in window) {
                  const { NDEFReader } = window;
                  const writer = new NDEFReader();

                  const jsonRecord = {
                    recordType: "mime",
                    mediaType: "application/ld+cbor",
                    data: Buffer.from(state.base32EncodedCborLd),
                  };
                  const res = await writer.write({
                    records: [jsonRecord],
                  });
                  setState({ res, write: true });
                }
              }}
            >
              Write
            </Button>
          </Grid>
        )}
        <Grid item sm={6}>
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={async () => {
              if ("NDEFReader" in window) {
                const { NDEFReader } = window;
                /* Scan NFC tags */
                const reader = new NDEFReader();
                reader.scan().then(() => {
                  console.log("Scan started successfully.");
                  reader.onerror = () => {
                    console.log(
                      "Cannot read data from the NFC tag. Try another one?"
                    );
                  };
                  reader.onreading = async (event) => {
                    let parsedRecords = [];
                    for (const record of event.message.records) {
                      console.log("Record type:  " + record.recordType);
                      console.log("MIME type:    " + record.mediaType);
                      console.log("Record id:    " + record.id);
                      console.log("Record data:    " + record.data);
                      if (record.mediaType === "application/ld+cbor") {
                        parsedRecords.push({
                          id: record.id,
                          recordType: record.recordType,
                          mediaType: record.mediaType,
                          data: await base32CborLdToJson(
                            Buffer.from(
                              buf2hex(record.data.buffer),
                              "hex"
                            ).toString("utf8")
                          ),
                        });
                      }
                    }
                    setState({ readFromTag: parsedRecords });
                  };
                });
              }
            }}
          >
            Read
          </Button>
        </Grid>
        {state.readFromTag && (
          <Grid item sm={6}>
            <pre>{JSON.stringify(state.readFromTag, null, 2)}</pre>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
