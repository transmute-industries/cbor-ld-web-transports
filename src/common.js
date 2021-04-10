import { encode, decode } from "@digitalbazaar/cborld";

import { documentLoader } from "./documentLoader";

import base32Encode from "base32-encode";
import base32Decode from "base32-decode";

export function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

export const jsonldDocument = {
  "@context": ["https://www.w3.org/ns/did/v1"],
  id: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
};

export const jsonLdToBase32CborLd = async (json) => {
  const cborldBytes = await encode({ jsonldDocument: json, documentLoader });
  const base32EncodedCborLd = base32Encode(cborldBytes, "RFC4648").replace(
    /=/g,
    ""
  );
  return base32EncodedCborLd;
};

export const base32CborLdToJson = async (base32EncodedCborLd) => {
  const decodedCborLdBytes = Uint8Array.from(
    Buffer.from(base32Decode(base32EncodedCborLd, "RFC4648"))
  );
  const decodedCborLd = await decode({
    cborldBytes: decodedCborLdBytes,
    documentLoader,
  });
  return decodedCborLd;
};
