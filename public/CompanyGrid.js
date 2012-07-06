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
 
Testr.CompanyGrid = Ext.extend(Testr.ui.CompanyGrid, {

	onRender: function(ct, position) {
	
		this.checkSelectModel.on('selectionchange', function(sm) {
			if (sm.getCount()) {
				this.removeButton.enable();
			} else {
				this.removeButton.disable();
			}
		}.createDelegate(this));

		this.addButton.handler = this.addCompany.createDelegate(this);
		this.removeButton.handler = this.deleteCompany.createDelegate(this);
		
		this.saveButton.handler = this.saveChanges.createDelegate(this);
		this.cancelButton.handler = this.cancelChanges.createDelegate(this);
		
		this.companyStore.load({params: {start: 0, limit: this.pageSize}});
		
		Testr.CompanyGrid.superclass.onRender.call(this, ct, position);
	},
	
	saveChanges: function() {
		this.getStore().save();
	},
	
	cancelChanges: function() {
		this.companyStore.load({
			params: {
				start: (this.bottomToolbar.getPageData().activePage - 1) * this.pageSize, 
				limit: this.pageSize
			}
		});
	},
	
	addCompany: function () {
		var store = this.getStore();
		var record = new store.reader.recordType({
			price: 0.00,
			change: 0.0,
			pctChange: 0.0,
			changedAt: new Date()
		});
		this.stopEditing();
		store.insert(0, record);
		this.startEditing(0, 1);
	},

	deleteCompany: function () {
		var store = this.getStore(),
			sm = this.getSelectionModel();
			
     	this.stopEditing();
	    sm.each(function(record){
			store.remove(record);
		});
	}
});

Ext.reg("companygrid", Testr.CompanyGrid);