const asyncHandler = (fn) => {
    console.log("✅ Async handler initialized for:", fn.name);
    
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
};

export default asyncHandler;