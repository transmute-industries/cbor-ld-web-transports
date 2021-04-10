import axios from "axios";

export const documentLoader = async (iri) => {
  if (iri.startsWith("http")) {
    const resp = await axios.get(iri);
    return {
      documentUrl: iri,
      document: resp.data,
    };
  }
  console.error(iri);
  throw new Error("unsupported iri " + iri);
};
