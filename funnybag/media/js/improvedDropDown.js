/* ImprovedDropDown */
/* Verison 1.0.2 */

/*
   Copyright 2011 John Fuex

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var debugMode = 0; //setting this to 1 will supress hiding the original select controls for debugging purposes.

var idd_list_suffix = '_iddlist';
var idd_icon_suffix = '_iddicon';
var idd_text_suffix = '_iddtext';
var idd_wrap_suffix = '_iddwrap';

var KEY_ESCAPE = 27;
var KEY_TAB = 9;
var KEY_ENTER = 13;
var KEY_UPARROW = 38;
var KEY_DOWNARROW = 40;
var KEY_LEFTARROW = 37;
var KEY_RIGHTARROW= 39;

var KEY_PRESS_FILTER_DELAY_MS = 120;

var resizeHandlerSet = false;
var suspendTextBoxExitHandler = false;

(function ($) {
    $.fn.improveDropDown = function (value) {
                                         if (!resizeHandlerSet) {
                                            $(window).resize(function() {delayCall('windowResize', function() { idd_windowResize(); }, 20 );} );
                                            $(document).click(windowDismissOpenLists);
                                            resizeHandlerSet = true;
                                          }

                                        if ((arguments.length==0)||typeof(value)=='object') { 
                                                //init

                                                var iconPath='./img/dropIcon.png';
                                                var noMatchesText='No Matches';
                                                var noItemsText='No Items Available';
                                            
                                                if (arguments.length==1) {
                                                  if ('iconPath' in value) {iconPath = value.iconPath.toString();}
                                                  if ('noMatchesText' in value) {noMatchesText = value.noMatchesText.toString();}
                                                  if ('noItemsText' in value) {noItemsText = value.noItemsText.toString();}
                                                }

                                            this.each(function () {
                                                var thisElement = $(this);

                                                var wrapperControl = getWrapperElement(thisElement);
                                                
                                                thisElement.after(wrapperControl);

                                                var newTextElement = getTextElement(thisElement);
                                                wrapperControl.prepend(newTextElement); 

                                                var newListControl = getListElement(thisElement);
                                                wrapperControl.append(newListControl); 

                                                populateList(thisElement, newListControl,noMatchesText,noItemsText);

                                                if (document.activeElement == thisElement[0]) {
                                                    //if replaced element had focus, move it to new control.
                                                    newTextElement.focus().select(); 
                                                }

                                                if (debugMode != 1) { 
                                                    thisElement.hide();                                                
                                                }
                                             });
                                         }
                                         else {  
                                                //setvalue                                               
                                                this.each(function () {
                                                    var listControl = getListControlFromOtherControl($(this));
                                                        if (listControl!=null) {
                                                            var item = findItemByValue(listControl, value);
                                                            if (item != null) { selectItem(item,true,true,false); }
                                                        }
                                                });
                                         }

                                         return this; //preserve chaining.
                                    };
    })(jQuery);



/** Start: Initializers and Control Builders **/
function getWrapperElement(sourceElement) {
    var newID = sourceElement.attr('id');
    var newWrapperElement = $('<span></span>');
    
    newWrapperElement.attr('id', newID + idd_wrap_suffix)
                     .css('border-style','none')
                     .css('white-space', 'nowrap')
                     .css('margin', '0')
                     .css('padding', '0')                     
                     .click(function () {return false;});

    return newWrapperElement;
}

function getTextElement(sourceElement) {
    //Important! imgElement must already be added to DOM and visible!

    var newID = sourceElement.attr('id');
    var newTextElement = $('<input type="text" />');

    newTextElement.attr('id', newID + idd_text_suffix)
                  .addClass('idd_textbox')
                  .attr('value', sourceElement.find('option:selected').text())
                  // .css('height', sourceElement.outerHeight() + 'px')
                  // .css('font-family', sourceElement.css('font-family'))
                  // .css('font-size', sourceElement.css('font-size'))
                  // .css('border-width', '1px')                                    
                  .attr('autocomplete', 'off');
                  // .attr('padding','0')
                  // .width(controlWidth);
    
    setIsDirty(newTextElement, false);

    newTextElement.keydown(function (e) {

        switch (e.which) {
            case KEY_ENTER:
                {
                    selectFirstMatch($(this), true);
                    e.stopPropagation();
                    return false;  //prevents form submit on enter key whenfocus is on this field.
                }

            case KEY_TAB:
                if (e.which == KEY_TAB) {
                    //handles case where mouseover dropdown  list and user presses tab key to leave field
                    selectFirstMatch($(this), true);
                    break;
                }

            case KEY_DOWNARROW:
                {
                    navItem($(this), 'forward');
                    e.stopPropagation();
                    return false;
                }

            case KEY_UPARROW:
                {
                    navItem($(this), 'back');
                    e.stopPropagation();
                    return false;
                }
        }
    });

    newTextElement.keyup(function (e) {
        var thisTextElement = $(this);
        switch (e.which) {
            case KEY_ESCAPE: closeListUndoTyping(thisTextElement); break;
            case KEY_TAB: break;
            case KEY_ENTER: break;
            case KEY_DOWNARROW: break;
            case KEY_UPARROW: break;
            case KEY_LEFTARROW: break;
            case KEY_RIGHTARROW: break;

            default: delayCall('updatefilter_' + this.id, function () { updateListFilter(thisTextElement); }, KEY_PRESS_FILTER_DELAY_MS);
        }
    });

    newTextElement.focusout(function () {
        if (!suspendTextBoxExitHandler) { 
           selectFirstMatch($(this),true);
        }
    });

    return newTextElement;
}

function getImageElement(sourceElement,iconPath) {
    var newID = sourceElement.attr('id');
    var newImgElement = $('<img />');
    var quirksModeOffset = jQuery.support.boxModel ? 0 : 2;

    newImgElement.attr('id', newID + idd_icon_suffix)
                 .attr('src',iconPath)
                 .addClass('idd_icon')
                 .css('cursor', 'pointer')
                 .css('height', (sourceElement.outerHeight() - quirksModeOffset) + 'px')
                 .css('vertical-align','middle')
                 .css('overflow','hidden')
                 .css('display','inline-block')
                 .css('margin','0');


    //prevents clicks on icon from firing lostfocus on textbox
    newImgElement.mouseenter(function () { suspendTextBoxExitHandler = true; });
    newImgElement.mouseleave(function () { suspendTextBoxExitHandler = false; });

    newImgElement.click(function (event) {
        var listControl = getListControlFromOtherControl($(this));
        var textControl = getTextControlFromOtherControl($(this));
        if (listControl.is(':visible')) {
            selectFirstMatch(textControl,true);
        }
        else {
            windowDismissOpenLists(listControl); 
            clearFilter(getTextControlFromOtherControl($(this)));
            showList(listControl)
            textControl.focus().select(); 
        }
               
        event.stopPropagation();
        return false;
    });

    return newImgElement;
}

function getListElement(sourceElement) {
    var newID = sourceElement.attr('id');
    var newListControl = $('<div></div>');

    newListControl.attr('id', newID + idd_list_suffix)
                  .css('position','absolute')    
                  .css('display','none')    
                  .css('overflow','auto')    
                  .css('overflow-y','auto')
                  .css('overflow-x', 'hidden') 
                  .css('padding-right','20px')
                  .addClass('idd_list')
                  .mouseenter(function () { suspendTextBoxExitHandler = true; })
                  .mouseleave(function () { suspendTextBoxExitHandler = false; });

    newListControl.keydown(function (e) {

        switch (e.which) {

            case KEY_DOWNARROW:
                {                    
                    navItem(getTextControlFromOtherControl($(this)), 'forward');
                  e.stopPropagation();
                    return false;
                }


            case KEY_UPARROW:
                {
                    navItem(getTextControlFromOtherControl($(this)), 'back');
                    e.stopPropagation();
                    return false;
                }
        }
    });

    return newListControl;
}

function populateList(existingSelectControl, newListControl,noMatchesText,noItemsText) {
    var noMatchesHeader = getListGroupItem(noMatchesText,false);
    noMatchesHeader.addClass('grpHdrNoMatches').addClass('idd_message');
    newListControl.append(noMatchesHeader);

    var sourceListItems = existingSelectControl.children('OPTGROUP, OPTION');
    if (sourceListItems.length == 0) {
        var noItemsHeader = getListGroupItem(noItemsText,true).addClass('idd_message');
        newListControl.append(noItemsHeader);
    }

    sourceListItems.each(
         function () {
             if (isOptGroup($(this))) { 
                populateListGroupItem(newListControl, $(this)); 
             }
             else { 
                populateListItem(newListControl, $(this)); 
             }
         });
}

function populateListGroupItem(newListControl, optionGroupItem) {
    var newListItem = getListGroupItem(optionGroupItem.attr('label'),true);    
    newListControl.append(newListItem);
    optionGroupItem.children('OPTION').each(function () { populateListItem(newListControl, $(this)); });
}

function getListGroupItem(label,visible) {
    var newListItem = $('<div>' + label + '</div>');
    newListItem.addClass('idd_listItemGroupHeader');
    newListItem.css('white-space','nowrap')
               .css('cursor','default');

   if (!visible) {newListItem.css('display','none');}
    
    return newListItem;
}

function populateListItem(newListControl, optionItem) {
    var title = '';
    var newListItem = $('<div>' + optionItem.text() + '</div>');
    
    newListItem.addClass('idd_listItem');
    
    if (isOptGroup(optionItem.parent())) {
        newListItem.addClass('idd_listItem_Nested');
        title = optionItem.parent().attr('label') + ': ';
    }

    title += newListItem.text();
    
    newListItem.attr('savedValue', optionItem.val())
               .attr('title', title)    
               .css('white-space','nowrap')
               .css('cursor','pointer');

    newListControl.append(newListItem);

    if((optionItem.attr("disabled")||'')=='') {
        newListItem.mouseover(function () {
            $(this).parent().find('.idd_listItem_Hover').removeClass('idd_listItem_Hover');
            $(this).addClass('idd_listItem_Hover');
        });
        newListItem.mouseout(function () { $(this).removeClass('idd_listItem_Hover'); });
        newListItem.click(function () { selectItem($(this),true,true,false);  });
    }
    else {
        newListItem.addClass('idd_listItem_Disabled');
    }
}
/** End: Initializers and Control Builders **/


/** Begin: Value Setters and Getters **/
function getItemValue(item) { return item.attr('savedValue'); }
function setItemValue(item, value) { item.attr('savedValue', value); }

function selectItem(selectedItem,forceDirty,closeList, supressChangeEvent) {    
    var listControl = selectedItem.parent();
    var textControl = getTextControlFromOtherControl(listControl);

    // update visible textbox 
    textControl.val(selectedItem.text());
  
   //update underlying control value
   var sourceControl = getSelectControlFromOtherControl(textControl); 
   sourceControl.val(getItemValue(selectedItem));

   if (forceDirty) {setIsDirty(textControl, true);}

   if (getIsDirty(textControl) && !supressChangeEvent) { 
        sourceControl.change(); 
        setIsDirty(textControl,false);
   }

   if (closeList) {
       listControl.hide();
   }
   else {              
       makeListItemVisible(listControl, selectedItem);
   }
}

function resetValue(textControl) {
    var SelectControl = getSelectControlFromOtherControl(textControl);
    textControl.val(SelectControl.find('option:selected').text());
    setIsDirty(textControl, false);
}

function findItemByValue(listControl,value) {
    var retVal = null;

    listControl.find('.idd_listItem').each(function () {
            var item = $(this);
            if (getItemValue(item) == value) { retVal=item; return false; }
        });

        return retVal;   
}

function getBestMatch(value, listControl) {
    // returns jquery idd_listItem div tag of matching item or null on nomatch

    var filterMatches = listControl.find('.idd_listItem:visible');
    var bestMatchElement;

    switch (filterMatches.length) {
        case 0: bestMatchElement = null; break;
        case 1: bestMatchElement = filterMatches.first(); break;
        default:
            var typedText = getTextControlFromOtherControl(listControl).val();
            var exactMatch = null;

            filterMatches.each(function () {
                if ($(this).text().toLowerCase() == typedText.toLowerCase()) {
                    exactMatch = $(this); return false;
                }
            });

            if (exactMatch!=null) {
                bestMatchElement = exactMatch.first();
            }
            else {
                bestMatchElement = filterMatches.first();
            }
    }
    return bestMatchElement;
}

function selectFirstMatch(textControl,closeList) {
    var listControl = getListControlFromOtherControl(textControl);

    if (getIsDirty(textControl)) {        
        var bestMatchItem = getBestMatch(textControl.val(), listControl);
        if (bestMatchItem == null) { resetValue(textControl); } else { selectItem(bestMatchItem,true,closeList,false); }
    }

    if (closeList) { listControl.hide(); }

    return bestMatchItem;
}

/** End: Value Setters and Getters **/

/* start: dropdown list management */
function windowDismissOpenLists(exceptionListElement) {
    $("div.idd_list:visible").each(function () {
        if ($(this) != exceptionListElement) {
            var txtElement = getTextControlFromOtherControl($(this));
            selectFirstMatch(txtElement,true);
        }
    });
}

function idd_windowResize() {
    //reset the position and size of absolutely positioned dropdown lists
    $('div.idd_list:visible').each(function () { positionList($(this))})
}

function closeListUndoTyping(textControl) {
    var listControl = getListControlFromOtherControl(textControl);

    resetValue(textControl)
    listControl.hide();    
}

function clearFilter(textControl) {
    var listControl = getListControlFromOtherControl(textControl);
    
    listControl.children('.idd_listItemGroupHeader').show();
    listControl.children('.grpHdrNoMatches').hide();

    listControl.children('.idd_listItem').show()
                                         .removeClass('idd_listItem_Hover');        
}

function showList(listControl) {
   if (!listControl.is(':visible')) {
        listControl.show();
        positionList(listControl);
   }
}

function positionList(listControl) {
        try {
            var textElement = getTextControlFromOtherControl(listControl);
            var imgElement = getImageControlFromOtherControl(listControl);

            var listTop = textElement.position().top + textElement.outerHeight();
            var listLeft = textElement.position().left;

            listControl.css('top', listTop + 'px');
            listControl.css('left', listLeft + 'px');         

            var childItems = listControl.children('.idd_listItem:visible,.idd_listItemGroupHeader:visible');

            var elementHeightPx = getElementsTotalHeightPx(childItems) + 5;
            var maxHeightPx = $(window).height() + $(document).scrollTop() - listControl.position().top - 20;
            var minListHeigtPx = 12;
            var listhHeight = Math.min(elementHeightPx, maxHeightPx)
            listhHeight = Math.max(listhHeight, minListHeigtPx);
            listControl.css('height', listhHeight + 'px');

            var widestListItemPx = getElementsLongestWidthPx(childItems.add('.idd_message'));

            var minListWidthPx = textElement.outerWidth() + imgElement.outerWidth()
            var listWidthPx = Math.max(minListWidthPx, widestListItemPx);

            var maxListWidthPx = $(window).width() - listControl.position().left - 30;
            listWidthPx = Math.min(maxListWidthPx, listWidthPx);

            childItems.css('width', listWidthPx + 'px');
            listControl.css('width', listWidthPx + 'px');

        } catch  (err)  { /*eat any sizing errors */ }
}

function getElementsLongestWidthPx(jElements) {
    var maxLenPx = 0;

    jElements.each(function () {
        thisControl = $(this);
        maxLenPx = Math.max(maxLenPx, thisControl.outerWidth());
    });

    return maxLenPx; 
}

function getElementsTotalHeightPx(jElements) {
    var maxHeight = 0;
 
    jElements.each(function () {
        maxHeight += $(this).outerHeight(); 
    });

    return maxHeight; 
}

function updateListFilter(textControl) {

    var typedValue = textControl.val();
    var listControl = getListControlFromOtherControl(textControl);
    var listItems = listControl.children('.idd_listItem')

    setIsDirty(textControl, true);    
    listItems.removeClass('idd_listItem_Hover');

    showList(listControl);
    listItems.each(
         function () {
             var itemText = $(this).text();
             $(this).toggle( (!$(this).hasClass('idd_listItem_Disabled')) && stringContainsCaseInsensitive(itemText, typedValue));
         });

    //show nomatches item, and no other headers if the filter excludes everything
    var anyMatches = Boolean(listItems.filter(':visible').length!=0);        
    listControl.children('.idd_listItemGroupHeader').toggle(anyMatches);
    listControl.children('.grpHdrNoMatches').toggle(!anyMatches);
    
    positionList(listControl); //resize list to fit new visible elements.
}

function getIsDirty(textControl) {
   return textControl.attr('isDirty') != '';
}

function setIsDirty(textControl,isDirty) {
   var dirtyVal = '';

   if (isDirty) { 
    dirtyVal = 'yes';
   }
   else {
    dirtyVal = '';
   }
    
   textControl.attr('isDirty',dirtyVal);
}


function navItem(textControl, navDirection) {
    var navForward = (navDirection.toString().toLowerCase() == 'forward');
    var listControl = getListControlFromOtherControl(textControl);
    var currentValue = textControl.val();

    var currentItem = listControl.find(".idd_listItem_Hover:eq(0)");
    var isItemSelected = (currentItem.length > 0);// && !getIsDirty(textControl);

    //if there is no current item, select best match for text box entry.
    if (!isItemSelected) {
        showList(listControl);
        currentItem = getBestMatch(currentValue, listControl);
    }
    
    var selectedItem;
    if ((currentItem != null) && (currentItem.length > 0)) {
        if (isItemSelected) {
            if (navForward) {
                selectedItem = currentItem.nextAll(".idd_listItem:visible").eq(0); //next visible item forward
            }
            else {
                selectedItem = currentItem.prevAll(".idd_listItem:visible").eq(0); //next visible item backward
            }
        }
        else {
            selectedItem = currentItem; 
        }

    }
    else {
        clearFilter(textControl);
        positionList(listControl);
        selectedItem = listControl.find(".idd_listItem:visible").eq(0); //first visible item.
    }

    if ((selectedItem != null) && (selectedItem.length>0)) {
        selectItem(selectedItem, Boolean(currentValue!=selectedItem.text()) ,false,true);
        if (isItemSelected) { listControl.find('.idd_listItem_Hover').removeClass('idd_listItem_Hover'); }
        selectedItem.addClass("idd_listItem_Hover");         
    }    
}

function makeListItemVisible(listControl, item) {

    var listHeight = listControl.innerHeight();
    var itemTop = item.position().top;
    var itemScrollTop = item.position().top + listControl.scrollTop();
    var itemBottom = itemTop + item.outerHeight();

    if ((itemBottom > listHeight) || (itemTop < 0)) {             
        listControl.scrollTop(itemScrollTop + (item.outerHeight() * 2) - listHeight);  
    }


}
/* end: dropdown list management */

/* start: Control converters and evaluators */
function getTextControlFromOtherControl(Control) {return swapControlSuffix(Control, idd_text_suffix);}
function getListControlFromOtherControl(Control) { return swapControlSuffix(Control, idd_list_suffix); }
function getImageControlFromOtherControl(Control) { return swapControlSuffix(Control, idd_icon_suffix); }
function getSelectControlFromOtherControl(Control) { return swapControlSuffix(Control, ''); }

function isOptGroup(control) { return control.get(0).tagName.toUpperCase() == 'OPTGROUP'; }

function swapControlSuffix(Control, newSuffix) {
    var controlID = Control.attr('id');
    var suffixStart = controlID.lastIndexOf('_');

    if (suffixStart<0) {
        return($('#' + controlID + newSuffix));
    }
    else {
        return $('#' + controlID.substr(0, suffixStart) + newSuffix);
    }
}
/* end: Control converters */


function stringContainsCaseInsensitive(SearchIn, SearchFor) { return (SearchIn.toLowerCase().indexOf(SearchFor.toLowerCase())>-1); }

/* start: Delayed calls methods  */
var delayedCalls = Object;

function delayCall(key, func, delayMs) {
    if (key in delayedCalls) {
        clearTimeout(delayedCalls[key]);                
    }      

    delayedCalls[key] = setTimeout(function () { processDelayedCall(key,func);} ,delayMs);
}

function processDelayedCall(key, func) {
     if (key in delayedCalls) { delete delayedCalls[key]; }
     func();
 }

/* end: Delayed calls methods  */
