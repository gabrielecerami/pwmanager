/*
 * jQuery UI Tooltip @VERSION
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tooltip
 *
 * Depends:
 *	jquery.ui.core.js
 *  jquery.ui.position.js
 */
(function($) {

var increments = 0;

$.widget("ui.tooltip", {
	_init: function() {
		var self = this;
		this.tooltip = $("<div/>").attr("id", "ui-tooltip-" + increments++).attr("role", "tooltip").attr("aria-hidden", "true").addClass("ui-tooltip ui-widget ui-corner-all").addClass(this.options.tooltipClass).appendTo(document.body).hide();
		this.tooltipContent = $("<div/>").addClass("ui-tooltip-content").appendTo(this.tooltip);
		this.opacity = this.tooltip.css("opacity");
		this.element
		.bind("focus.tooltip mouseover.tooltip", function(event) {
			self.show($(event.target));
		})
		.bind("blur.tooltip mouseout.tooltip", function(event) {
			self.close();
		});
	},
	
	destroy: function() {
		this.element.unbind(".tooltip");
		this.tooltip.remove();
		$.widget.prototype.destroy.apply(this, arguments);
	},
	
	widget: function() {
		return this.tooltip;
	},
	
	show: function(target) {
		if (this.options.disabled)
			return;
		var self = this;
		this.current = target;
		this.currentTitle = target.attr("title");
		var content = this.options.content.call(target[0], function(response) {
			if (self.current == target)
				self.open(target, response);
		});
		if (content) {
			self.open(target, content);
		}
	},
	
	open: function(target, content) {
		if (!content)
			return;
		
			
		target.attr("title", "");
		this.tooltipContent.html(content);
		this.tooltip.position($.extend(this.options.position, {
			of: target
		}));
		
		this.tooltip.attr("aria-hidden", "false");
		target.attr("aria-describedby", this.tooltip.attr("id"));

		if (this.tooltip.is(":animated"))
			this.tooltip.stop().show().fadeTo("normal", this.opacity);
		else
			this.tooltip.is(':visible') ? this.tooltip.fadeTo("normal", this.opacity) : this.tooltip.fadeIn();

		this._trigger("show", null, { target: target });
	},
	
	close: function() {
		if (!this.current)
			return;
		
		this.current.removeAttr("aria-describedby");
		this.tooltip.attr("aria-hidden", "true");
		
		if (this.tooltip.is(':animated'))
				this.tooltip.stop().fadeTo("normal", 0);
			else
				this.tooltip.stop().fadeOut();
		
		this.current.attr("title", this.currentTitle);
		this.current = null;
	}
	
});

$.ui.tooltip.defaults = {
	tooltipClass: "ui-widget-content",
	content: function() {
		return $(this).attr("title");
	},
	position: {
		my: "left center",
		at: "right center",
		offset: "15 0"
	}
}

})(jQuery);
