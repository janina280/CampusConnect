function truncateString(str, num) {
    return str?.length > num ? `${str?.slice(0, num)}...` : str;
  }

  export default truncateString;

