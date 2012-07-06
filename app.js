/*
 * The majority of this code is my own, but a few parts were copied from  
 * ExtJS grid examples.  That code's license appears below.  My code is
 * likewise GNU GPL license v3 Licensed (http://www.gnu.org/copyleft/gpl.html)
 */
 
 /*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

var util = require('util'),
  inspect = function(item){ util.puts(util.inspect(item)); };
  

var mongoose = require('mongoose'),
    ObjectID = mongoose.Schema.ObjectId; 

mongoose.model('Company',new mongoose.Schema({
	name: String,
	price: Number,
	change: Number,
	pctChange: Number,
    changedAt: String
}));
    /*
mongoose.model('Company', {

    collection: 'companies',

	properties: ['name', 'price', 'change', 'pctChange', 'changedAt'],
	
	cast: {
      name: String,
	  price: Number,
	  change: Number,
	  pctChange: Number,
      changedAt: String //force mongoDB to save getTime() as a string so we can easily get it back and cast to a date
    },

    indexes: [[{name: 1}]],

    methods: {
        save: function(callback){
			// on save update the timestamp value
            this.changedAt = (new Date()).getTime();
            this.__super__(callback);
        },
		toObject: function(){
			// convert getTime() saved as a string back into a number
            this.changedAt = parseInt(this.changedAt);
            return this.__super__();
        }
    }
});
*/

var db = mongoose.connect('mongodb://localhost/direct');
var Company = mongoose.model('Company');

// add a class level update method that only commits properties on the object
Company.update = function(id, doc, fn){
	var self = this;
	id = (id instanceof ObjectID || id.toHexString) ? id : ObjectID.createFromHexString(id);
	this._collection.update({_id: id}, {$set: doc}, {upsert: false, safe: true}, function(err){
		if (err) return self._connection._error(err);
		if (fn) return self.findById(id, fn, true);
	});
	return this;
};

var list = [
	{company:'3m Co',price:71.72,change:0.02,pctChange:0.03,lastChange:'9/1 12:00am'},
	{company:'Alcoa Inc',price:29.01,change:0.42,pctChange:1.47,lastChange:'9/1 12:00am'},
	{company:'Altria Group Inc',price:83.81,change:0.28,pctChange:0.34,lastChange:'9/1 12:00am'},
	{company:'American Express Company',price:52.55,change:0.01,pctChange:0.02,lastChange:'9/1 12:00am'},
	{company:'American International Group, Inc.',price:64.13,change:0.31,pctChange:0.49,lastChange:'9/1 12:00am'},
	{company:'AT&T Inc.',price:31.61,change:-0.48,pctChange:-1.54,lastChange:'9/1 12:00am'},
	{company:'Boeing Co.',price:75.43,change:0.53,pctChange:0.71,lastChange:'9/1 12:00am'},
	{company:'Caterpillar Inc.',price:67.27,change:0.92,pctChange:1.39,lastChange:'9/1 12:00am'},
	{company:'Citigroup, Inc.',price:49.37,change:0.02,pctChange:0.04,lastChange:'9/1 12:00am'},
	{company:'E.I. du Pont de Nemours and Company',price:40.48,change:0.51,pctChange:1.28,lastChange:'9/1 12:00am'},
	{company:'Exxon Mobil Corp',price:68.1,change:-0.43,pctChange:-0.64,lastChange:'9/1 12:00am'},
	{company:'General Electric Company',price:34.14,change:-0.08,pctChange:-0.23,lastChange:'9/1 12:00am'},
	{company:'General Motors Corporation',price:30.27,change:1.09,pctChange:3.74,lastChange:'9/1 12:00am'},
	{company:'Hewlett-Packard Co.',price:36.53,change:-0.03,pctChange:-0.08,lastChange:'9/1 12:00am'},
	{company:'Honeywell Intl Inc',price:38.77,change:0.05,pctChange:0.13,lastChange:'9/1 12:00am'},
	{company:'Intel Corporation',price:19.88,change:0.31,pctChange:1.58,lastChange:'9/1 12:00am'},
	{company:'International Business Machines',price:81.41,change:0.44,pctChange:0.54,lastChange:'9/1 12:00am'},
	{company:'Johnson & Johnson',price:64.72,change:0.06,pctChange:0.09,lastChange:'9/1 12:00am'},
	{company:'JP Morgan & Chase & Co',price:45.73,change:0.07,pctChange:0.15,lastChange:'9/1 12:00am'},
	{company:'McDonald\'s Corporation',price:36.76,change:0.86,pctChange:2.40,lastChange:'9/1 12:00am'},
	{company:'Merck & Co., Inc.',price:40.96,change:0.41,pctChange:1.01,lastChange:'9/1 12:00am'},
	{company:'Microsoft Corporation',price:25.84,change:0.14,pctChange:0.54,lastChange:'9/1 12:00am'},
	{company:'Pfizer Inc',price:27.96,change:0.4,pctChange:1.45,lastChange:'9/1 12:00am'},
	{company:'The Coca-Cola Company',price:45.07,change:0.26,pctChange:0.58,lastChange:'9/1 12:00am'},
	{company:'The Home Depot, Inc.',price:34.64,change:0.35,pctChange:1.02,lastChange:'9/1 12:00am'},
	{company:'The Procter & Gamble Company',price:61.91,change:0.01,pctChange:0.02,lastChange:'9/1 12:00am'},
	{company:'United Technologies Corporation',price:63.26,change:0.55,pctChange:0.88,lastChange:'9/1 12:00am'},
	{company:'Verizon Communications',price:35.57,change:0.39,pctChange:1.11,lastChange:'9/1 12:00am'}
];

// repopulate the collection on startup
Company.remove({}, function(){
	list.forEach(function(item){
		var newCompany = new Company();
        newCompany.set({name: item.company, price: item.price, change: item.change, pctChange: item.pctChange});
		newCompany.save(function (err, data) {
                //console.log(err);
                //console.log(data);
            });
	});
});


/** obiekt, który jest controlerem obsługiwanym przez directProvidera
* może zawierać dowolną obsługę bazy danych MongoDB, my SQL
* ważny jest tylko format zwracanego obiektu
*/


var company = { 
	Company: {
		create: function(params){
			params = params || {rows: []};
			var callback = this;
			try {
				var results = [],
					count = params.rows.length;
				
				// loop thru the new records and save each in turn
				params.rows.forEach(function(record){
					var company = new Company(record);
					company.save(function(){
						results.push(company.toObject());
						
						// once we've saved them all, make the callback
						if (results.length == count) {
							callback(null, {
								total: count,
								rows: results,
								success: true
							});
						}
					});
				});
			} catch (err) {
				util.puts('insert exception');
				inspect(err);
				
				callback(null, {
					success: false,
					msg: 'Failed to add one or more companies'
				});
			}
		},

		update: function(params){
			params = params || {rows: []};
			var callback = this;
			try {
				var results = [],
					count = params.rows.length;
				
				// loop thru the rows and update each
				params.rows.forEach(function(updates){
					var id = updates._id;
					delete updates._id; // leaving this confuses mongoDB
					updates.changedAt = (new Date()).getTime();
					
					Company.update(id, updates, function(record){
						results.push(record.toObject());
						
						// once we've updated them all, make the callback
						if (results.length == count) {
							callback(null, {
								total: count,
								rows: results,
								success: true
							});
						}
					});
				});
			} catch (err) {
				util.puts('update exception');
				inspect(err);
				
				callback(null, {
					success: false,
					msg: 'Failed to update one or more companies'
				});
			}
		},
		
		destroy: function(params){
			params = params || {rows: []};
			var callback = this;
			try {				
				//convert the object ids from string to hex before searching
				params.rows.forEach(function(id, index){
					params.rows[index] = ObjectID.createFromHexString(id);
				});
				// remove them all with one call!
				Company.remove({_id: {$in: params.rows}}, function(){
					callback(null, {
						total: 0,
						rows: [],
						success: true
					});
				});
			} catch (err) {
				util.puts('delete exception');
				inspect(err);
				
				callback(null, {
					success: false,
					msg: 'Failed to delete one or more companies'
				});
			}
		},
		
		getAll: function(params){
            console.log('[start] GetAll ');
			params = params || {};
		
			var sortOrder,
				startAt = params.start || 0,
				returnOnly = params.limit;
			
            //TODO:
            // wprowadzić kontrolę sortowania
			if (params.sort && params.dir) {
				//sortOrder.push([params.sort, params.dir === 'ASC' ? '1' : '-1']);
                //sortOrder=(params.dir === 'ASC' ? '1' : '-1');
			}

            //TODO:
            // poprawić format zwracanego obiektu
            //to co jest poniżej to stara wersja
            // count nie jest liczony - jakiś totalny OLD
			var callback = this;
			Company.count({}, function(count){
                console.log('count ' + count);
                console.log('sortOrder ' + sortOrder);
                console.log('startAt ' + startAt);
                console.log('returnOnly ' + returnOnly);
				Company
                    .find({})
                    .sort(params.sort,'ASC' ? '1' : '-1')
                    .skip(startAt)
                    .limit(returnOnly)
                    .exec(function(err,companies){
                        
					    var results = new Array(companies.length);
					    companies.forEach(function(item, index) {
						    results[index] = item.toObject();
					    });
    					try {                            
    						callback(null, {
    							total: count,
    							rows: results
    						});
    					} catch (err) {
    						callback(err);
    					}
    				}, true);
			});
		}
	}
};

var //connect = require('./lib/connect'),
	express=require ('express'),
	root = __dirname + "/public",

// Create a server with no initial setup
	app = module.exports = express.createServer();

app.configure(function () {
        //app.set('views', app.setup.app.views.dir);
        //app.set('view engine', app.setup.app.views.engine);
        app.use(express.bodyParser());//parse JSON into objects
        app.use(express.methodOverride());
        app.use(app.router);
	app.use(express.static(root));
    });
    
    app.configure('development', function () {    
        app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }));
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });


/*
// Add global filters
app.use("/",
    //connect.responseTime(),
    connect.logger({ format: ':method :url :response-time' })
);
*/
// Serve dynamic responses
var direct = require('./lib/directProvider')(company)
app.post("/direct", direct);

/*
// Serve static resources
app.use("/",
    connect.static(root)
);
*/



app.listen(3002);
