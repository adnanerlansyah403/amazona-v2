// import { disconnect } from "./db";

const getError = (err) => {
  return err.response && err.response.data && err.response.data.message
    ? err.response.data.message
    : err.message
};

// const onError = async (err, req, res, next) => {
//   await disconnect();
//   res.status(500).send({ message: err.toString() });
// };

export { getError }