errorObject = {
  statusCode: null,
  errorMessage: ""
};

module.exports = (statusCode, errorMessage) => {
  errorObject.statusCode = statusCode;
  errorObject.errorMessage = errorMessage;
  return errorObject;
};
