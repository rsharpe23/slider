;

(function ($) {
  'use strict';

  $.widget('rsharpe.slider', {
    _create: function () {
      this.$item = this.element.children('.active:first');
      this.isReady = true;
    },

    slide: function (type) {
      if (!this.isReady) {
        return;
      }

      var $newItem = this.$item[type]();
      this._doSlide({
        $element: $newItem,
        type: type,
      });
    },

    _doSlide: function (to) {
      if (!to.$element.length) {
        return;
      }

      var tClassesStr = [to.type, 'active'].join(' ');
      to.$element.addClass(tClassesStr);

      to.$element[0].offsetWidth; // HACK: force reflow
      to.$element.removeClass(to.type);

      var type = to.type == 'prev' ? 'next' : 'prev';
      this.$item.addClass(type);

      this._onSlideBeforeEnd(function () {
        var classesStr = [type, 'active'].join(' ');
        this.$item.removeClass(classesStr);

        this._onSlideEnd(to.$element);
      });
    },

    _onSlideBeforeEnd: function (completeCb) {
      this.isReady = false;

      Util.onTransitionEnd(
        this.$item, 
        $.proxy(completeCb, this)
      );
    },

    _onSlideEnd: function ($newItem) {
      this.$item = null;
      this.$item = $newItem;
      this.isReady = true;
    },
  });

})(jQuery);