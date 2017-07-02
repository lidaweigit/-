var express = require('express');
var router = express.Router();
var async = require('async');

//连接mongodb数据库
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = "mongodb://127.0.0.1:27017/random";

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

// 点名页面的路由		localhost:3000/callName
router.get('/callName', function(req, res, next) {
		
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			res.render('error',{
				message:'连接数据库失败',
				error:{}
			});
		}else{
			var conn=db.collection('sz1705');
			conn.find().toArray(function(err,arr){
				if(err){
					res.render('error',{
						message:'数据查询失败',
						error:{}
					});
				}else{
					res.render('callName',{
						bjm:'sz1705',
						list:JSON.stringify(arr)
					})
				}
			})
		}
		db.close();  
		console.log('第一次修改');
	})
});

// 列表页面的路由		localhost:3000/list
router.get('/list', function(req, res, next) {
	
	// 获取random数据库里面的同学信息
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		if(err) {
			res.send('获取同学信息出错');
		} else {
			var conn = db.collection('sz1705');
			async.waterfall([
				// 得到random数据库里面的同学信息总条数
				function(cb) {

					conn.find().count(function(err, num) {
						if(err) {
							cb('查询失败');
						} else {
							cb(null, num);
						}
					})
				},
				// 根据上一个步骤里面给我的 num 做计算，计算出，总的 页数
				function(num, cb) {

					var total = num;                         // 总页数
					var pageSize = 10;                       // 每页显示条数
					var pages = Math.ceil(total / pageSize); // 总页数
					var pageIndex = req.query.pageIndex || 1;// 当前需要显示第几页的数据

					conn.find().skip((pageIndex - 1) * pageSize).limit(pageSize).toArray(function(err, arr) {
						if(err) {
							cb('查询失败');
						} else {
							cb(null, {
								list: arr,
								pages: pages,
								pageIndex: pageIndex
							});
						}
					})
				}
			], function(err, result) {
				if(err) {
					res.send(err);
				} else {
					res.render('list', result);
				}
			})
		}
	})
});


// 修改数据库中count的路由
router.get('/add',function(req,res,next){
	
	var name=req.query.name;	
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			res.send({
				code:-1,
				msg:'连接数据库失败'
			});
		}else{
			var conn=db.collection('sz1705');
			conn.update({name,name},{$inc:{count:1}},function(err,info){
				if(err){
					res.send({
						code:-2,
						msg:'修改失败'
					});
				}else{
					res.send({
						code:0,
						msg:'成功'
					})
				}
			})
		}
		db.close();
	})
})

module.exports = router;