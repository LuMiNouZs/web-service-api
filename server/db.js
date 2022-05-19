var mysql=require("mysql");

const connection=mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:';yom^vv]@2016-db',
    database:'zoom-phone'
})

connection.connect(function(err){
    if (err) throw err;

});

module.exports = connection;