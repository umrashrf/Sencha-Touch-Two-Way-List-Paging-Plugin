/**
 * @author Umair Ashraf
 * www.umairashraf.me
 */
/**
 * Adds a Next Records at the bottom of the list and and a Previous Records button at the top of the list. 
 * When the user presses these button, the next/previous page of data will be loaded into the store and 
 * appended to the List.
 *
 * Note: The list requires your web response to have totalPages property and your store function 
 * getTotalCount() to return the number of pages. You can also calculate this if your web response has 
 * number of total record of records property and modify the logic at line 94.
 * 
 * ## Example
 *
 *     Ext.define('TweetList', {
 *         extend: 'Ext.List',
 *
 *         config: {
 *             store: Ext.create('TweetStore'),
 *
 *             plugins: [
 *                 {
 *                     xclass: 'Ext.plugin.TwoWayListPaging',
 * 					   prevButtonText: 'Previous Records',
 *                     nextButtonText: 'Next Records'
 *                 }
 *             ],
 *
 *             itemTpl: [
 *                 '<img src="{profile_image_url}" />',
 *                 '<div class="tweet">{text}</div>'
 *             ]
 *         }
 *     });
 *
 */
Ext.define('Ext.plugin.TwoWayListPaging', {
	extend : 'Ext.Component',
	alias : 'plugin.twowaylistpaging',

	config : {
		/**
		 * @cfg {String} prevButtonText The text used as the label of the Previous page button.
		 */
		prevButtonText : 'Previous Records',

		/**
		 * @cfg {String} nextButtonText The text used as the label of the Next page button.
		 */
		nextButtonText : 'Next Records',

		buttonTpl : ['<div class="{cssPrefix}loading-spinner" style="font-size: 180%; margin: 10px auto;">', '<span class="{cssPrefix}loading-top"></span>', '<span class="{cssPrefix}loading-right"></span>', '<span class="{cssPrefix}loading-bottom"></span>', '<span class="{cssPrefix}loading-left"></span>', '</div>', '<div class="{cssPrefix}list-paging-msg">{buttonText}</div>'].join('')
	},

	init : function(list) {
		var me = this;

		me.list = list;
		me.store = list.getStore();

		me.store.on('load', me.onListUpdate, me);

		Ext.Function.createInterceptor(this.setStore, function(newStore, oldStore) {
			if(newStore) {
				newStore.on('load', 'onListUpdate', this);
			}
			if(oldStore) {
				oldStore.un('load', 'onListUpdate', this);
			}
		}, this);
	},
	applyButtonTpl : function(config) {
		return (Ext.isObject(config) && config.isTemplate) ? config : new Ext.XTemplate(config);
	},
	onBeforeLoad : function() {
		if(this.loading && this.list.store.getCount() > 0) {
			return false;
		}
	},
	onListUpdate : function() {
		this.loading = false;
		this.addPrevNextCmps();

		if(this.prevButtonCmp) {
			this.prevButtonCmp.removeCls(Ext.baseCSSPrefix + 'loading');
		}
		if(this.nextButtonCmp) {
			this.nextButtonCmp.removeCls(Ext.baseCSSPrefix + 'loading');
		}

		this.fireEvent('onListUpdate');
	},
	addPrevNextCmps : function() {
		var totalPages = this.store.getTotalCount();

		// Disable main list load mask
		this.list.onBeforeLoad = function() {
			return true;
		}
		// only add this button if the current page is not 1
		if(!this.prevButtonCmp && this.store.currentPage > 1) {
			this.prevButtonCmp = this.list.insert(0, {
				xclass : 'Ext.dataview.element.List',
				baseCls : Ext.baseCSSPrefix + 'list-paging',
				html : this.getButtonTpl().apply({
					cssPrefix : Ext.baseCSSPrefix,
					buttonText : this.getPrevButtonText()
				}),
				listeners : {
					itemtap : 'loadPrevPage',
					scope : this
				}
			});
		} else if(this.prevButtonCmp && this.store.currentPage <= 1) {
			this.list.remove(this.prevButtonCmp);
			this.prevButtonCmp = null;
		}

		if(!this.nextButtonCmp && this.store.currentPage < totalPages) {
			this.nextButtonCmp = this.list.add({
				xclass : 'Ext.dataview.element.List',
				baseCls : Ext.baseCSSPrefix + 'list-paging',
				html : this.getButtonTpl().apply({
					cssPrefix : Ext.baseCSSPrefix,
					buttonText : this.getNextButtonText()
				}),
				listeners : {
					itemtap : 'loadNextPage',
					scope : this
				}
			});
		} else if(this.nextButtonCmp && this.store.currentPage >= totalPages) {
			this.list.remove(this.nextButtonCmp);
			this.nextButtonCmp = null;
		}
	},
	loadPrevPage : function() {
		this.prevButtonCmp.addCls(Ext.baseCSSPrefix + 'loading');

		this.list.getStore().removeAll();
		this.list.getStore().previousPage({
			addRecords : true
		});
	},
	loadNextPage : function() {
		this.nextButtonCmp.addCls(Ext.baseCSSPrefix + 'loading');

		this.list.getStore().removeAll();
		this.list.getStore().nextPage({
			addRecords : true
		});
	}
});