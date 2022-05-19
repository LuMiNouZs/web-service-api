var express= require('express');
var router= express.Router();


router.use(require('./api-sync'));
router.use(require('./api-accounts'));
router.use(require('./api-plans'));

module.exports= router;
