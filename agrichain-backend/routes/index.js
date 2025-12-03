const router = require('express').Router();
router.use(require('./auth'));
router.use(require('./farmer'));
router.use(require('./customer'));
router.use(require('./supplier'));
router.use(require('./tracking'));
router.use(require('./contact'));
router.use(require('./metrics'));
module.exports = router;
