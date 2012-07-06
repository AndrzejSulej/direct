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

Ext.ns('Testr.ui');
Testr.ui.CompanyGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	stripeRows: true,
	clicksToEdit: 1,
	
	autoExpandColumn: 'company',
	columnLines: true,
	
	height: 300,
	width: 600,
    
	stateful: false,
	
	viewConfig: {
		forceFit: true,
		deferEmptyText: false,
		emptyText: 'No companies found.'
	},

	frame: true,
	loadMask: {msg: 'Loading Companies...'},
	title: 'Ext.Direct Grid w/ NodeJS, Connect, Mongoose & MongoDB',
	iconCls: 'icon-grid',
	
	initComponent: function() {
		
		this.pageSize = 10;
		
		function change(val){
			if(val > 0){
				return "<span style='color:green;'>" + val + '</span>';
			}else if(val < 0){
				return "<span style='color:red;'>" + val + '</span>';
			}
			return val;
		}

		function pctChange(val){
			if(val > 0){
				return "<span style='color:green;'>" + val + '%</span>';
			}else if(val < 0){
				return "<span style='color:red;'>" + val + '%</span>';
			}
			return val;
		}
		
		Ext.app.REMOTING_API = {
			type: 'remoting',
			url: '/direct',
			actions: {
				Company: [
					{name: 'create', len: 1},
					{name: 'getAll', len: 1},
					{name: 'update', len: 1},
					{name: 'destroy', len: 1}
				]
			}
		};
		
		Ext.Direct.addProvider(Ext.app.REMOTING_API); 
		
		this.companyStore = new Ext.data.DirectStore({
			storeId: 'companies',
						
			autoLoad: false,
			autoSave: false,
			remoteSort: true,
			autoDestroy: false,
			
			baseParams: {
				sort: 'name',
				dir: 'ASC'
			},
			
			api: {
				read: Company.getAll,
				create: Company.create,
				update: Company.update,
				destroy: Company.destroy
			},
			
			root: 'rows',
			totalProperty: 'total',
			idProperty: '_id',
			fields: [
				{name: 'id', mapping: '_id'},
				{name: 'name'},
				{name: 'price', type: 'float'},
				{name: 'change', type: 'float'},
				{name: 'pctChange', type: 'float'},
				{name: 'changedAt', type: 'date', dateFormat: 'time'}
			],
			
			writer: new Ext.data.JsonWriter({
				encode: false,
				writeAllFields : false,
				listful : true
			}),
			
			sortInfo: {
				field: 'name', 
				direction: 'ASC'
			}
		});

		this.checkSelectModel = new Ext.grid.CheckboxSelectionModel();
		
		// create the Grid
		var config = {
			store: this.companyStore,
			
			cm: new Ext.grid.ColumnModel({
				defaults: {
		        	sortable: true
				},
				
				columns: [
					this.checkSelectModel,
			    	{
						header: 'Company', 
						width: 40, 
						dataIndex: 'name',
							
						editor: {
							xtype: 'textfield',
							maxLength: 255,
							allowBlank: true
						}
					}, {
						header: 'Price', 
						width: 20, 
						dataIndex: 'price',

						renderer: Ext.util.Format.usMoney, 
						editor: {
							xtype: 'numberfield',
							selectOnFocus: true,
							allowNegative: false,
							allowDecimals: true,
							decimalPrecision: 2,
							minValue: 0,
							value: 0
						}
					}, {
						header: 'Change', 
						width: 20, 
						dataIndex: 'change', 
						
						renderer: Ext.util.Format.numberRenderer('0.00'),
						editor: {
							xtype: 'numberfield',
							selectOnFocus: true,
							allowNegative: true,
							allowDecimals: true,
							decimalPrecision: 2,
							value: 0
						}
					}, {
						header: '% Change', 
						width: 20, 
						dataIndex: 'pctChange',
						
						renderer: function (value){
							return Ext.util.Format.number(value || 0, '0.00')+'%';
						},
						editor: {
							xtype: 'numberfield',
							selectOnFocus: true,
							allowNegative: true,
							allowDecimals: true,
							decimalPrecision: 2,
							value: 0
						}
					}, {
						header: 'Last Updated', 
						width: 25, 
						renderer: Ext.util.Format.dateRenderer('m/d/y g:i a'), 
						dataIndex: 'changedAt'
			        }
				]
			}),
			
			sm: this.checkSelectModel,

			// inline buttons
			buttons: [
				{
					text: 'Save',
					ref: '../saveButton'
				},
				{
					text: 'Cancel',
					ref: '../cancelButton'
				}
			],
			buttonAlign:'center',

			// inline toolbars
			tbar:[{
				text: 'Add Company',
				tooltip: 'Add a new row',
				iconCls: 'add',

				// Place a reference in the GridPanel
				ref: '../addButton'
			}, '-', {
				text: 'Remove Company',
				tooltip: 'Remove selected item(s)',
				iconCls: 'remove',

				// Place a reference in the GridPanel
				ref: '../removeButton',
				disabled: true
			}],

			bbar: new Ext.PagingToolbar({
		        pageSize: this.pageSize,
		        store: this.companyStore,
		        displayInfo: true,
		        displayMsg: 'Displaying companies {0} - {1} of {2}',
		        emptyMsg: 'No companies displayed'
		    })
		};
		
		Ext.apply(this, config);
		Ext.apply(this.initialConfig, config);
				
		Testr.ui.CompanyGrid.superclass.initComponent.call(this);
   }
});