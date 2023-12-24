const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file , cd){
        console.log(file);
        cd(null, "./public/images/uploads")
    },
    filename: function(req, file, cd){
         let modifiedName = 
         file.fieldname + Date.now() + '-' + path.extname(file.originalname);
         cd(null, modifiedName);
    },
});

const upload = multer({
    
    storage: storage,
    // fileFilter: function(req, file, cd){
    //     let filetypes = /jpeg|jpg|png|svg|webp|gif/;
    //     let mimetype = filetypes.test(file.mimetype);
    //     let extname = filetypes.test(
    //         path.extname(file.originalname).toLowerCase()
    //     );

    //     if(mimetype && extname){
    //         return(null, true);
    //     };
    //     cd(
    //         "Error: File upload supports only the following.." + filetypes
    //     )
    // }

});

module.exports = upload