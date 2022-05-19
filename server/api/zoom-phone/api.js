var express= require('express');
var router= express.Router();


router.use(require('./api-auth'));
router.use(require('./api-zoom-phone'));
router.use(require('./api-zoom-exchange'));

module.exports= router;
