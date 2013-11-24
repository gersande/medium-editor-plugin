editor = new Object();
var changed = false;
function changeTrue() {
  changed = true;
}

function changeReset() {
  changed = false;
}

function hasChanged() {
  return changed;
}

function checkChanged() {
  if(hasChanged()) {
    if(confirm('You have unsaved changes on this page. Are you sure you want to load a new document?')) {
      changed = false;
    }
    else {
      changed = true;
    }
  }
  return changed;
}
function checkExtension(extension) {
  var ext = false;
  var exts = [
    'gif',
    'png',
    'jpg',
    'jpeg'
  ];
  if(jQuery.inArray(extension, exts) >= 0) {
    ext = true;
  }
  return ext;
}
function toggleFullscreenEditing() {
  $jq = jQuery.noConflict();
  var editorDiv = $jq('.CodeMirror');
  if(!editorDiv.hasClass('CodeMirror-fullscreen')) {
    toggleFullscreenEditing.beforeFullscreen = { 
      height: editorDiv.height(),
      scrollHeight: editorDiv.height() - 33,
      width: editorDiv.width() 
    }
    editorDiv.addClass('CodeMirror-fullscreen');
    editorDiv.height('100%');
    $jq('.CodeMirror-scroll').height(editorDiv.height() - 30);
    editorDiv.width('100%');
    $jq('#wpe_qt_content_save').show();
    editor.refresh();
  }
  else {
    editorDiv.removeClass('CodeMirror-fullscreen');
    editorDiv.height(toggleFullscreenEditing.beforeFullscreen.height);
    $jq('.CodeMirror-scroll').height(toggleFullscreenEditing.beforeFullscreen.scrollHeight);
    editorDiv.width('100%');
    $jq('#wpe_qt_content_save').hide();
    editor.refresh();
  }
}

(function($){
  var c = function(){
    
  };
  $.extend(c.prototype, {
    name:'folders',initialize:function(element, handler){
      function ajaxFolders(handler){
        if(!checkChanged()) {
          handler.preventDefault();
          var newElement = $(this).closest('li', element);
          newElement.length || (newElement = element);
          if(newElement.hasClass(ajaxObject.options.open) && !newElement.hasClass('file')) {
            newElement.removeClass(ajaxObject.options.open).children('ul').slideUp();
          }
          else if(!newElement.hasClass(ajaxObject.options.open) && newElement.hasClass('file')) {
            // Removed in 1.0.2 to fix issues with reloading a version that was not correct.
            //if(newElement.data('content') != null) {
            //  editor.toTextArea();
            //  $('#new-content').val(newElement.data('content'));
            //  $('#file').val(newElement.data('file'));
            //  $('#path').val(newElement.data('path'));
            //  $('#extension').val(newElement.data('extension'));
            //  $('.current_file').html(newElement.data('file'));
            //  console.log(newElement.data('file'))
            //  runCodeMirror(newElement.data('extension'));
            //}
            if(checkExtension(newElement.data('extension'))) {
              $.fancybox(this);
            }
            else {
              var type = $('#content-type').val();
              runAjaxRequest(newElement, ajaxObject, 'file', type);
            }
          }
          else {
            var type = $('#content-type').val();
            runAjaxRequest(newElement, ajaxObject, null, type);
          }
        }
        else {
          return false;
        }
      }
      function runAjaxRequest(newElement, ajaxObject, contentType, type) {
        if(contentType === 'file'){
          var contents = 1;
        }
        else {
          var contents = 0;
        }
        if(newElement.data('encoded') === 1) {
          var path = newElement.data('path');
        }
        else {
          var path = encodeURI(newElement.data('path'));
        }
        newElement.addClass(ajaxObject.options.loading),
        $.post(
          ajaxObject.options.url, {
            action: 'ajax_folders',
            dir: path,
            contents: contents,
            type: type
          }, function(result){
            if(contentType === 'file'){
              newElement.removeClass(ajaxObject.options.loading);
              if(result.content == null) {
                $('#save-result').html('<div id="save-message" class="WPEditorAjaxError"></div>');
                $('#save-message').append('<h3>Warning</h3><p>An error occured while trying to open this file</p>');
                $('#save-result').fadeIn(1000).delay(3000).fadeOut(300);
              }
              else {
                var notWritable = '';
                if(!result.writable) {
                  $('p.submit').hide();
                  $('div.writable-error').show();
                  notWritable = ' <span class="not-writable">(not writable)</span>';
                  $('.writable_status').html('Browsing');
                }
                else {
                  $('p.submit').show();
                  $('div.writable-error').hide();
                  $('.writable_status').html('Editing');
                }
                editor.toTextArea();
                $('#new-content').val(result.content);
                $('#file').val(result.file);
                $('#path').val(result.path);
                $('#extension').val(result.extension);
                $('.current_file').html(result.file + notWritable);
                runCodeMirror(result.extension);
              }
            }
            else {
              newElement.removeClass(ajaxObject.options.loading).addClass(ajaxObject.options.open);
              result.length && (
                newElement.children().remove('ul'),
                newElement.append('<ul>').children('ul').hide(),
                $.each(result, function(index, value){
                  if(checkExtension(value.extension)) {
                    newElement.children('ul').append(
                      $('<li><a href="' + value.url + '" class="fancybox ' + value.filetype + '">' + value.name + ' <span class="tiny">' + value.filesize + '</span></a></li>').addClass(
                        value.extension + ' ' + value.filetype
                      ).data({
                        'path': value.path,
                        'content': value.content,
                        'filesize': value.filesize,
                        'file': value.file,
                        'extension': value.extension,
                        'url': value.url,
                        'writable': value.writable
                      }
                    ))
                  }
                  else {
                    var writable = '';
                    var writableClass = '';
                    if(!value.writable) {
                      writable = '<span class="writable">&times;</span>';
                      writableClass = ' not-writable';
                    }
                    newElement.children('ul').append(
                      $('<li><a href="#" class="' + value.filetype + writableClass + '">' + writable + ' ' + value.name + ' <span class="tiny">' + value.filesize + '</span></a></li>').addClass(
                        value.extension + ' ' + value.filetype
                      ).data({
                        'path': value.path,
                        'content': value.content,
                        'filesize': value.filesize,
                        'file': value.file,
                        'extension': value.extension,
                        'url': value.url,
                        'writable': value.writable
                      }
                    ))
                  }
                }),
                newElement.find('ul a').bind('click', ajaxFolders),
                newElement.children('ul').slideDown()
              )
            }
        }, 'json')
      }
      var ajaxObject = this;
      this.options = $.extend({
        url: '',
        path: '',
        url: '',
        encoded: '',
        content: '',
        filesize: '',
        file: '',
        extension: '',
        writable: '',
        open: 'opened',
        loading: 'loading'
      }, handler);
      element.data({
        'path': this.options.path, 
        'encoded': this.options.encoded, 
        'content': this.options.content,
        'filesize': this.options.filesize,
        'file': this.options.file,
        'extension': this.options.extension,
        'url': this.options.url,
        'writable': this.options.writable
      }).bind('retrieve:finder', ajaxFolders).trigger('retrieve:finder')
    }
  });
  $.fn[c.prototype.name] = function(){
    var b = arguments
    var g = b[0] ? b[0] : null;
    return this.each(function(){
      var f = $(this);
      if(c.prototype[g] && f.data(c.prototype.name) && g != 'initialize'){
        f.data(c.prototype.name)[g].apply(
          f.data(c.prototype.name),
          Array.prototype.slice.call(b, 1)
        );
      }
      else if(!g || $.isPlainObject(g)){
        var e = new c;
        c.prototype.initialize && e.initialize.apply(e, $.merge([f], b));
        f.data(c.prototype.name, e)
      }
      else {
        $.error('Method ' + g + ' does not exist on jQuery.' + c.name)
      }
    })
  }
})(jQuery);
(function($){
  $(document).ready(function(){
    
    $('#new-content').change(function() {
      changeTrue();
    });
    
    $('#save-result').click(function() {
      $(this).hide();
    });
    $('.ajax-settings-form').submit(function() {
      var data = getFormData($(this).attr('id'));
      $.ajax({
          type: "POST",
          url: ajaxurl,
          data: data,
          dataType: 'json',
          success: function(result) {
            $('#save-result').html("<div id='save-message' class='" + result[0] + "'></div>");
            $('#save-message').append(result[1]);
            $('#save-result').fadeIn(1000).delay(3000).fadeOut(300);
          }
      });
      return false;
    });
    
    $('.ajax-editor-update').submit(function() {
      editor.save(); // Implemented .save() in 1.0.2 instead of .toTextArea() to fix issues with not maintaining line numbers
      var data = {
        action: 'save_files',
        real_file: $('#path').val(),
        new_content: $('#new-content').val(),
        file: $('#file').val(),
        plugin: $('#plugin-dirname').val(),
        extension: $('#extension').val(),
        _success: $('#_success').val()
      }
      // Removed in 1.0.2
      //runCodeMirror($('#extension').val());
      $.ajax({
          type: "POST",
          url: ajaxurl,
          data: data,
          dataType: 'json',
          success: function(result) {
            // Removed in 1.0.2
            //editor.save();
            $('#save-result').html("<div id='save-message' class='" + result[0] + "'></div>");
            $('#save-message').append(result[1]);
            $('#save-result').fadeIn(1000).delay(3000).fadeOut(300);
            changeReset();
            // Removed in 1.0.2
            //runCodeMirror(result[2]);
          }
      });
      return false;
    });
    $(window).bind('beforeunload', function() {
      if(hasChanged()) {
        return 'Leaving this page will undo all changes you have made.';
      }
    });
  });
})(jQuery);
function enableThemeAjaxBrowser(path) {
  $jq = jQuery.noConflict();
  var c;
  var url = ajaxurl;
  $jq('#theme-folders').folders({
    url: url,
    path: path,
    encoded: 1
  }).delegate('a','click',function() {
    $jq('#theme-folders li').removeClass('selected');
    c = $jq(this).parent().addClass('selected').data('path')
  });
}
function enablePluginAjaxBrowser(path) {
  $jq = jQuery.noConflict();
  var c;
  var url = ajaxurl;
  $jq('#plugin-folders').folders({
    url: url,
    path: path,
    encoded: 1
  }).delegate('a','click',function() {
    $jq('#plugin-folders li').removeClass('selected');
    c = $jq(this).parent().addClass('selected').data('path')
  });
}
function getFormData(formId) {
  $jq = jQuery.noConflict();
  var theForm = $jq('#' + formId);
  var str = '';
  $jq('input:not([type=checkbox], :radio), input[type=checkbox]:checked, input:radio:checked, select, textarea', theForm).each(
    function() {
      var name = $jq(this).attr('name');
      var val = encodeURIComponent($jq(this).val());
      str += name + '=' + val + '&';
    }
  );
  return str.substring(0, str.length-1);
}
function settingsTabs(tab) {
  $jq = jQuery.noConflict();
  $jq('#settings-' + tab).show();
  $jq('#settings-loading').hide();
  $jq('#settings-' + tab + '-tab a').addClass('active');      
  $jq('div.settings-tabs ul li a').click(function(){
    var thisClass = $jq(this).attr('id').replace('settings-link-','');
    $jq('div.settings-body').hide();
    $jq('#settings-' + thisClass).fadeIn(300);
    $jq('div.settings-tabs ul li a').removeClass('active');
    $jq('#settings-link-' + thisClass).addClass('active');
  });
}

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

if (window.module !== undefined) {
    module.exports = MediumEditor;
}

(function (window, document) {
    'use strict';

    function extend(b, a) {
        var prop;
        if (b === undefined) {
            return a;
        }
        for (prop in a) {
            if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
                b[prop] = a[prop];
            }
        }
        return b;
    }

    // http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
    // by Tim Down
    function saveSelection() {
        var i,
            len,
            ranges,
            sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
        return null;
    }

    function restoreSelection(savedSel) {
        var i,
            len,
            sel = window.getSelection();
        if (savedSel) {
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        }
    }

    // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
    // by You
    function getSelectionStart() {
        var node = document.getSelection().anchorNode,
            startNode = (node && node.nodeType === 3 ? node.parentNode : node);
        return startNode;
    }

    // http://stackoverflow.com/questions/4176923/html-of-selected-text
    // by Tim Down
    function getSelectionHtml() {
        var i,
            html = "",
            sel,
            len,
            container;
        if (window.getSelection !== undefined) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                container = document.createElement("div");
                for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (document.selection !== undefined) {
            if (document.selection.type === "Text") {
                html = document.selection.createRange().htmlText;
            }
        }
        return html;
    }

    MediumEditor.prototype = {
        defaults: {
            anchorInputPlaceholder: 'Paste or type a link',
            delay: 0,
            diffLeft: 0,
            diffTop: -10,
            disableReturn: false,
            disableToolbar: false,
            firstHeader: 'h3',
            forcePlainText: true,
            allowMultiParagraphSelection: true,
            placeholder: 'Type your text',
            secondHeader: 'h4',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote']
        },

        init: function (elements, options) {
            this.elements = typeof elements === 'string' ? document.querySelectorAll(elements) : elements;
            if (this.elements.length === 0) {
                return;
            }
            this.isActive = true;
            this.parentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];
            this.id = document.querySelectorAll('.medium-editor-toolbar').length + 1;
            this.options = extend(options, this.defaults);
            return this.initElements()
                       .bindPaste()
                       .setPlaceholders()
                       .bindWindowActions();
        },

        initElements: function () {
            var i;
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].setAttribute('contentEditable', true);
                if (!this.elements[i].getAttribute('data-placeholder')) {
                    this.elements[i].setAttribute('data-placeholder', this.options.placeholder);
                }
                this.elements[i].setAttribute('data-medium-element', true);
                this.bindParagraphCreation(i).bindReturn(i);
                if (!this.options.disableToolbar && !this.elements[i].getAttribute('data-disable-toolbar')) {
                    this.initToolbar()
                        .bindSelect()
                        .bindButtons()
                        .bindAnchorForm();
                }
            }
            return this;
        },

        bindParagraphCreation: function (index) {
            var self = this;
            this.elements[index].addEventListener('keyup', function (e) {
                var node = getSelectionStart(),
                    tagName;
                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('disable-return'))) {
                    document.execCommand('formatBlock', false, 'p');
                }
                if (e.which === 13 && !e.shiftKey) {
                    node = getSelectionStart();
                    tagName = node.tagName.toLowerCase();
                    if (!(self.options.disableReturn || this.getAttribute('data-disable-return')) && tagName !== 'li') {
                        document.execCommand('formatBlock', false, 'p');
                        if (tagName === 'a') {
                            document.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },

        bindReturn: function (index) {
            var self = this;
            this.elements[index].addEventListener('keypress', function (e) {
                if (e.which === 13 && !e.shiftKey) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    }
                }
            });
        },

        buttonTemplate: function(btnType) {
            var buttonTemplates = {
                'bold': '<li><button class="medium-editor-action medium-editor-action-bold" data-action="bold" data-element="b">B</button></li>',
                'italic': '<li><button class="medium-editor-action medium-editor-action-italic" data-action="italic" data-element="i">I</button></li>',
                'underline': '<li><button class="medium-editor-action medium-editor-action-underline" data-action="underline" data-element="u">U</button></li>',
                'superscript': '<li><button class="medium-editor-action medium-editor-action-superscript" data-action="superscript" data-element="sup">x<sup>1</sup></button></li>',
                'subscript': '<li><button class="medium-editor-action medium-editor-action-subscript" data-action="subscript" data-element="sub">x<sub>1</sup></button></li>',
                'anchor': '<li><button class="medium-editor-action medium-editor-action-anchor" data-action="anchor" data-element="a">#</button></li>',
                'header1': '<li><button class="medium-editor-action medium-editor-action-header1" data-action="append-' + this.options.firstHeader + '" data-element="' + this.options.firstHeader + '">h1</button></li>',
                'header2': '<li><button class="medium-editor-action medium-editor-action-header2" data-action="append-' + this.options.secondHeader + '" data-element="' + this.options.secondHeader + '">h2</button></li>',
                'quote': '<li><button class="medium-editor-action medium-editor-action-quote" data-action="append-blockquote" data-element="blockquote">&ldquo;</button></li>',
                'orderedlist': '<li><button class="medium-editor-action medium-editor-action-orderedlist" data-action="insertorderedlist" data-element="ol">1.</button></li>',
                'unorderedlist': '<li><button class="medium-editor-action medium-editor-action-unorderedlist" data-action="insertunorderedlist" data-element="ul">&bull;</button></li>'
            };
            return buttonTemplates[btnType] || false;
        },

        //TODO: actionTemplate
        toolbarTemplate: function () {
            var btns = this.options.buttons,
                html = '<ul id="medium-editor-toolbar-actions" class="medium-editor-toolbar-actions clearfix">',
                i,
                tpl;

            for (i = 0; i < btns.length; i += 1) {
                tpl = this.buttonTemplate(btns[i]);
                if (tpl) {
                    html += tpl;
                }
            }
            html += '</ul>' +
                '<div class="medium-editor-toolbar-form-anchor" id="medium-editor-toolbar-form-anchor">' +
                '    <input type="text" value="" placeholder="' + this.options.anchorInputPlaceholder + '"><a href="#">&times;</a>' +
                '</div>';
            return html;
        },

        initToolbar: function () {
            this.toolbar = this.createToolbar();
            this.keepToolbarAlive = false;
            this.anchorForm = this.toolbar.querySelector('.medium-editor-toolbar-form-anchor');
            this.anchorInput = this.anchorForm.querySelector('input');
            this.toolbarActions = this.toolbar.querySelector('.medium-editor-toolbar-actions');
            return this;
        },

        createToolbar: function () {
            var toolbar = document.createElement('div');
            toolbar.id = 'medium-editor-toolbar-' + this.id;
            toolbar.className = 'medium-editor-toolbar';
            toolbar.innerHTML = this.toolbarTemplate();
            document.getElementsByTagName('body')[0].appendChild(toolbar);
            return toolbar;
        },

        bindSelect: function () {
            var self = this,
                timer = '',
                i;
            this.checkSelectionWrapper = function (e) {
                clearTimeout(timer);
                setTimeout(function () {
                    self.checkSelection(e);
                }, self.options.delay);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('mouseup', this.checkSelectionWrapper);
                this.elements[i].addEventListener('keyup', this.checkSelectionWrapper);
                this.elements[i].addEventListener('blur', this.checkSelectionWrapper);
            }
            return this;
        },

        checkSelection: function () {
            var newSelection,
                pCount,
                selectionHtml,
                selectionElement;

            if (this.keepToolbarAlive !== true && this.toolbar !== undefined) {
                newSelection = window.getSelection();
                selectionHtml = getSelectionHtml();
                // Check if selection is between multi paragraph <p>.
                pCount = selectionHtml.match(/<(p|blockquote)>([\s\S]*?)<\/(p|blockquote)>/g);
                pCount = pCount ? pCount.length : 0;
                if (newSelection.toString().trim() === '' || (this.options.allowMultiParagraphSelection === false && pCount > 1)) {
                    this.hideToolbarActions();
                } else {
                    selectionElement = this.getSelectionElement();
                    this.selection = newSelection;
                    this.selectionRange = this.selection.getRangeAt(0);
                    if (selectionElement && this.elements[0] === selectionElement && !selectionElement.getAttribute('data-disable-toolbar')) {
                        this.setToolbarButtonStates()
                            .setToolbarPosition()
                            .showToolbarActions();
                    }
                }
            }
            return this;
        },

        getSelectionElement: function () {
            var selection = window.getSelection(),
                range = selection.getRangeAt(0),
                parent = range.commonAncestorContainer.parentNode;
            try {
                while (!parent.getAttribute('data-medium-element')) {
                    parent = parent.parentNode;
                }
            } catch (err) {
                return false;
            }
            return parent;
        },

        setToolbarPosition: function () {
            var buttonHeight = 50,
                selection = window.getSelection(),
                range = selection.getRangeAt(0),
                boundary = range.getBoundingClientRect(),
                defaultLeft = (this.options.diffLeft) - (this.toolbar.offsetWidth / 2),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth = this.toolbar.offsetWidth / 2;
            if (boundary.top < buttonHeight) {
                this.toolbar.classList.add('medium-toolbar-arrow-over');
                this.toolbar.classList.remove('medium-toolbar-arrow-under');
                this.toolbar.style.top = buttonHeight + boundary.bottom - this.options.diffTop + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            } else {
                this.toolbar.classList.add('medium-toolbar-arrow-under');
                this.toolbar.classList.remove('medium-toolbar-arrow-over');
                this.toolbar.style.top = boundary.top + this.options.diffTop + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            }
            if (middleBoundary < halfOffsetWidth) {
                this.toolbar.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((window.innerWidth - middleBoundary) < halfOffsetWidth) {
                this.toolbar.style.left = window.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                this.toolbar.style.left = defaultLeft + middleBoundary + 'px';
            }
            return this;
        },

        setToolbarButtonStates: function () {
            var buttons = this.toolbarActions.querySelectorAll('button'),
                i;
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].classList.remove('medium-editor-button-active');
            }
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var parentNode = this.selection.anchorNode;
            if (!parentNode.tagName) {
                parentNode = this.selection.anchorNode.parentNode;
            }
            while (parentNode.tagName !== undefined && this.parentElements.indexOf(parentNode.tagName) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                parentNode = parentNode.parentNode;
            }
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('[data-element="' + tag + '"]');
            if (el !== null && el.className.indexOf('medium-editor-button-active') === -1) {
                el.className += ' medium-editor-button-active';
            }
        },

        bindButtons: function () {
            var buttons = this.toolbar.querySelectorAll('button'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (self.selection === undefined) {
                        self.checkSelection(e);
                    }
                    if (this.className.indexOf('medium-editor-button-active') > -1) {
                        this.classList.remove('medium-editor-button-active');
                    } else {
                        this.className += ' medium-editor-button-active';
                    }
                    self.execAction(this.getAttribute('data-action'), e);
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].addEventListener('click', triggerAction);
            }
            this.setFirstAndLastItems(buttons);
            return this;
        },

        setFirstAndLastItems: function (buttons) {
            buttons[0].className += ' medium-editor-button-first';
            buttons[buttons.length - 1].className += ' medium-editor-button-last';
            return this;
        },

        execAction: function (action, e) {
            if (action.indexOf('append-') > -1) {
                this.execFormatBlock(action.replace('append-', ''));
                this.setToolbarPosition();
                this.setToolbarButtonStates();
            } else if (action === 'anchor') {
                this.triggerAnchorAction(e);
            } else {
                document.execCommand(action, false, null);
                this.setToolbarPosition();
            }
        },

        triggerAnchorAction: function () {
            if (this.selection.anchorNode.parentNode.tagName.toLowerCase() === 'a') {
                document.execCommand('unlink', false, null);
            } else {
                if (this.anchorForm.style.display === 'block') {
                    this.showToolbarActions();
                } else {
                    this.showAnchorForm();
                }
            }
            return this;
        },

        execFormatBlock: function (el) {
            var selectionData = this.getSelectionData(this.selection.anchorNode);
            // FF handles blockquote differently on formatBlock
            // allowing nesting, we need to use outdent
            // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
            if (el === 'blockquote' && selectionData.el && selectionData.el.parentNode.tagName.toLowerCase() === 'blockquote') {
                return document.execCommand('outdent', false, null);
            }
            if (selectionData.tagName === el) {
                el = 'p';
            }
            return document.execCommand('formatBlock', false, el);
        },

        getSelectionData: function (el) {
            var tagName;

            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }

            while (el && this.parentElements.indexOf(tagName) === -1) {
                el = el.parentNode;
                if (el && el.tagName) {
                    tagName = el.tagName.toLowerCase();
                }
            }

            return {
                el: el,
                tagName: tagName
            };
        },

        getFirstChild: function (el) {
            var firstChild = el.firstChild;
            while (firstChild !== null && firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
            return firstChild;
        },

        bindElementToolbarEvents: function (el) {
            var self = this;
            el.addEventListener('mouseup', function (e) {
                self.checkSelection(e);
            });
            el.addEventListener('keyup', function (e) {
                self.checkSelection(e);
            });
        },

        hideToolbarActions: function () {
            this.keepToolbarAlive = false;
            this.toolbar.classList.remove('medium-editor-toolbar-active');
        },

        showToolbarActions: function () {
            var self = this,
                timer;
            this.anchorForm.style.display = 'none';
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            clearTimeout(timer);
            timer = setTimeout(function() {
                if (!self.toolbar.classList.contains('medium-editor-toolbar-active')) {
                    self.toolbar.classList.add('medium-editor-toolbar-active');
                }
            }, 100);
        },

        showAnchorForm: function () {
            this.toolbarActions.style.display = 'none';
            this.savedSelection = saveSelection();
            this.anchorForm.style.display = 'block';
            this.keepToolbarAlive = true;
            this.anchorInput.focus();
            this.anchorInput.value = '';
        },

        bindAnchorForm: function () {
            var linkCancel = this.anchorForm.querySelector('a'),
                self = this;
            this.anchorForm.addEventListener('click', function (e) {
                e.stopPropagation();
            });
            this.anchorInput.addEventListener('keyup', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    self.createLink(this);
                }
            });
            this.anchorInput.addEventListener('blur', function (e) {
                self.keepToolbarAlive = false;
                self.checkSelection();
            });
            linkCancel.addEventListener('click', function (e) {
                e.preventDefault();
                self.showToolbarActions();
                restoreSelection(self.savedSelection);
            });
            return this;
        },

        createLink: function (input) {
            restoreSelection(this.savedSelection);
            document.execCommand('createLink', false, input.value);
            this.showToolbarActions();
            input.value = '';
        },

        bindWindowActions: function () {
            var timerResize,
                self = this;
            window.addEventListener('resize', function () {
                clearTimeout(timerResize);
                timerResize = setTimeout(function () {
                    if (self.toolbar.classList.contains('medium-editor-toolbar-active')) {
                        self.setToolbarPosition();
                    }
                }, 100);
            });
            return this;
        },

        activate: function () {
            var i;
            if (this.isActive) {
                return;
            }
            this.isActive = true;
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].setAttribute('contentEditable', true);
            }
            this.bindSelect();
        },

        deactivate: function () {
            var i;
            if (!this.isActive) {
                return;
            }
            this.isActive = false;

            if (this.toolbar !== undefined) {
                this.toolbar.style.display = 'none';
            }

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeEventListener('mouseup', this.checkSelectionWrapper);
                this.elements[i].removeEventListener('keyup', this.checkSelectionWrapper);
                this.elements[i].removeEventListener('blur', this.checkSelectionWrapper);
                this.elements[i].removeAttribute('contentEditable');
            }
        },

        bindPaste: function () {
            if (!this.options.forcePlainText) {
                return;
            }
            var i,
                self = this,
                pasteWrapper = function (e) {
                    var paragraphs,
                        html = '',
                        p;
                    e.target.classList.remove('medium-editor-placeholder');
                    if (e.clipboardData && e.clipboardData.getData) {
                        e.preventDefault();
                        if (!self.options.disableReturn) {
                            paragraphs = e.clipboardData.getData('text/plain').split(/[\r\n]/g);
                            for (p = 0; p < paragraphs.length; p += 1) {
                                html += '<p>' + paragraphs[p] + '</p>';
                            }
                            document.execCommand('insertHTML', false, html);
                        } else {
                            document.execCommand('insertHTML', false, e.clipboardData.getData('text/plain'));
                        }
                    }
                };
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('paste', pasteWrapper);
            }
            return this;
        },

        setPlaceholders: function () {
            var i,
                activatePlaceholder = function (el) {
                    if (el.textContent.replace(/^\s+|\s+$/g, '') === '') {
                        el.classList.add('medium-editor-placeholder');
                    }
                },
                placeholderWrapper = function (e) {
                    this.classList.remove('medium-editor-placeholder');
                    if (e.type !== 'keypress') {
                        activatePlaceholder(this);
                    }
                };
            for (i = 0; i < this.elements.length; i += 1) {
                activatePlaceholder(this.elements[i]);
                this.elements[i].addEventListener('blur', placeholderWrapper);
                this.elements[i].addEventListener('keypress', placeholderWrapper);
            }
            return this;
        }

    };

}(window, document));
