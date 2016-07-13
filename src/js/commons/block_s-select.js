DfxStudio.blocks['s-select'] = (function(){

    function Instance () {}

    Instance.prototype.getRegexp = function ( str ) {
        return new RegExp('^' + str );
    };

    Instance.prototype.filter = function () {
        var reg = this.getRegexp( this.elements.$input.val() ),
            that = this;
        this.list.forEach(function(e){
            that.items[e].li.attr('data-show', reg.test(e));
        });
    };

    Instance.prototype.dump = function () {
        var that = this,
            dump = {short: '', full: []};
        dump.short = this.list.map(function(e){
                var checked = that.items[e].checkbox[0].checked;
                dump.full.push({name: e, checked: !!checked});
                return +checked;
            }).join('');
        return dump;
    };

    /**
     * @param {Boolean} all
     */
    Instance.prototype.checkUncheckAll = function ( all ) {
        var that = this;
        this.list.forEach(function(e){
            that.items[e].checkbox[0].checked = all;
            that.items[e].li.attr('data-checked', !!all);
        });
    };

    /**
     * invoked with jQuery onchange
     */
    Instance.prototype.itemCheckboxChanged = function () {
        this.parentNode.parentNode.setAttribute('data-checked', this.checked);
    };

    /**
     * find items of list, fill this.items
     */
    Instance.prototype.findItems = function () {
        var $items = this.elements.$list.find('.s-select_item');

        this.items = {};
        
        for ( var i = 0, l = $items.length; i < l; i++ ) {
            var $item     = $($items[i]),
                name      = $item.find('label').text();

            $item.attr('data-show', true);

            this.items[name] = {
                li       : $item,
                checkbox : $item.find('input[type="checkbox"]')
            }
        }
    };

    Instance.prototype.behaviours = {

        keyupInSearchField : function ( instance ) {
            this.elements.$input.keyup(function(){instance.filter()});

        },

        listClick : function ( instance ) {
            this.elements.$list.click(function(){instance.elements.$input.focus()});
        },

        screenClick : function ( instance ) {
            this.elements.$screen.click(function(e){
                e.stopPropagation();
                instance.elements.$root.attr('data-isactive', true);
                instance.elements.$input.focus()
            });
        },

        mouseLeave : function ( instance ) {
            this.elements.$root.mouseleave(function(){

                instance.elements.$root.attr('data-isactive', false);
                instance.elements.$input.val('');
                instance.filter();

                instance.elements.$showChecked[0].checked       =
                    instance.elements.$showUnchecked[0].checked = true;

                instance.elements.$knobs.attr('data-knob-checkness', '');

                var dump = instance.dump();
                if ( instance.lastShortDump === dump.short ) return;
                instance.lastShortDump = dump.short;
                instance.onChange.call(
                    instance.$block, {target: instance.$block, list:dump.full}
                );

                instance.setScreenText();
            });

        },

        clickOnKnobs : function ( instance ) {
            this.elements.$knobs.click(function (e) {
                e.stopPropagation();
                instance.elements.$input.focus();

                if (
                        !instance.elements.$showChecked[0].checked &&
                        !instance.elements.$showUnchecked[0].checked
                    ) {
                        instance.elements.$showUnchecked[0].checked   =
                            instance.elements.$showChecked[0].checked = true;
                }

                instance.elements.$knobs.attr('data-knob-checkness', (
                    instance.elements.$showUnchecked[0].checked &&
                    instance.elements.$showChecked[0].checked
                        ? ''
                        : instance.elements.$showUnchecked[0].checked
                            ? 'unchecked'
                            : 'checked'
                ));
            });
        },

        clickOnCheckAll : function ( instance ) {
            this.elements.$knobs
                .find('button[data-check="all"]')
                .click(function(){instance.checkUncheckAll(true)});
        },

        clickOnCheckNone : function ( instance ) {
            instance.elements.$knobs
                .find('button[data-check="none"]')
                .click(function(){instance.checkUncheckAll()});
        },

        onItemChange : function ( instance ) {
            for ( var item in instance.items )
                instance.items[item].checkbox.change(instance.itemCheckboxChanged);
        },
    }

    Instance.prototype.setBehaviour = function () {
        for ( var func in this.behaviours ) this.behaviours[func].call(this, this);
    };

    Instance.prototype.sortList = function ( list ) {
        return list.sort(function(a, b) {
            return a.name > b.name
                ? 1
                : a.name < b.name
                    ? -1
                    : 0;
        });
    };

    Instance.prototype.findElements = function ( o ) {
        var $block = $(o.where);
        this.$block = $block;
        this.elements = {};
        this.elements.$list = $block.find('ul.s-select_list');
        this.elements.$knobs = $block.find('.s-select_knobs');
        this.elements.$showChecked = this.elements.$knobs
            .find('.s-select_knob-switch[data-knob="checked"]');
        this.elements.$showUnchecked = this.elements.$knobs
            .find('.s-select_knob-switch[data-knob="unchecked"]');
        this.elements.$screen = $block.find('.s-select_list-screen');
        this.elements.$root = $block.find('.s-select_root');
        this.elements.$input = this.elements.$knobs.find('.s-select-search');
    };

    Instance.prototype.setScreenText = function () {
        this.elements.$screen.text(
            !/1/.test(this.lastShortDump) ? this.emptyText : ''
        );
    };

    Instance.prototype.render = function ( where, list ) {
        where.innerHTML = DfxStudio.templates.blocks['s-select']({list: list});
    };

    Instance.prototype.create = function ( o ) {
        var sortedList = this.sortList(o.list),
            instance = this;

        this.render(o.where, sortedList);
        this.findElements(o);
        this.findItems();
        this.list          = sortedList.map(function(e){ return e.name });
        this.onChange      = o.onChange  || function(){};
        this.emptyText     = o.emptyText || 'nothing is choosen';
        this.lastShortDump = this.dump().short;
        this.setScreenText(); 
        this.setBehaviour();

        return this;
    };

    return Instance;
})();
