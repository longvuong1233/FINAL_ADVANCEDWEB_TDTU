const checkLogged = (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/login");
    }
  };
  
  const checkFaculty = (req, res, next) => {
    if (req.user.role == "faculty") {
      next();
    } else {
      res.redirect("back");
    }
  };

  const checkAdmin= (req,res,next)=>{
    if (req.user.role == "admin") {
        next();
      } else {
        res.redirect("back");
      }
  }
  
  module.exports = {
    checkLogged,
    checkFaculty,
    checkAdmin
  };
  