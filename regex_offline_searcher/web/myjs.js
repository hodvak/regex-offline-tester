const regex_input = document.getElementById('regex_input');
const text_input = document.getElementById('text_input');
const result = document.getElementById('results');
// all the checkboxes have class `my_checks`
const checkboxes = document.getElementsByClassName('my_checks');


regex_input.addEventListener('input', change);
text_input.addEventListener('input', change);
for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', change);
}

function change() {
    let checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
    let flags = 0;
    for (let i = 0; i < checkboxes.length; i++) {
        flags += parseInt(checkboxes[i].value);
    }
    eel.check_findall(regex_input.value, text_input.innerText.replaceAll('\u200C', ''),flags)();
}

function get_as_html_new(text, data) {
    if (data.length === 0) {
        return text;
    }
    let new_html = text.slice(0, data[0][0][1][0]);
    for (let i = 0; i < data.length; i++) {
        let new_text = text.slice(data[i][0][1][0], data[i][0][1][1]);
        new_html += get_as_html(new_text, data[i], data[i][0][1][0], 0)[1];
        if (i < data.length - 1) {
            new_html += text.slice(data[i][0][1][1], data[i + 1][0][1][0]);
        } else {
            new_html += text.slice(data[i][0][1][1], text.length);
        }

    }
    return new_html;
}

function get_as_html(text, groups, offset, number) {

    if (groups.length === 0) {
        return [number, text];
    }
    let new_html = text.slice(0, groups[0][1][0] - offset);
    for (let i = 0; i < groups.length; i++) {
        new_html += '<span class="my_' + (number % 10) + '">';
        let new_text = text.slice(groups[i][1][0] - offset, groups[i][1][1] - offset);
        let new_groups = [];
        let j;
        for (j = i + 1; j < groups.length; j++) {
            if (groups[j][1][0] >= groups[i][1][1]) {
                break;
            }
            new_groups.push(groups[j]);
        }
        let new_html_small;
        [number, new_html_small] = get_as_html(new_text, new_groups, groups[i][1][0], number + 1);
        new_html += new_html_small;
        new_html += '</span>';
        if (j < groups.length - 1) {
            new_html += text.slice(groups[i][1][1] - offset, groups[i + 1][1][0] - offset);
        } else {
            new_html += text.slice(groups[i][1][1] - offset, text.length);
        }
        i = j - 1;
    }
    return [number, new_html];
}

function getCurrentCursorPosition(element) {
    let selection = window.getSelection();
    if (element.nodeType === Node.TEXT_NODE) {
        if (selection.focusNode === element) {
            return [true, selection.focusOffset];
        } else {
            return [false, element.textContent.length];
        }
    }
    // check for br and count as 1
    else if ((element.tagName === 'BR') || (element.tagName === 'DIV' && element.innerHTML.length === 0)) {
        return [false, 1];
    } else {
        if (selection.focusNode === element) {
            if (element.tagName == 'SPAN' && element.className == 'my_br') {
                return [true, 1]
            }
            return [true, selection.focusOffset];
        }
        let children = element.childNodes;
        let sum = 0;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            let [isFocus, offset] = getCurrentCursorPosition(child);
            sum += offset;
            if (isFocus) {
                return [true, sum];
            }
        }
        return [false, sum];
    }
}


function SetCurrentCursorPosition(con, chars) {
    if (con.nodeType === Node.TEXT_NODE) {
        if (con.textContent.length >= chars) {
            con.parentNode.focus();
            let range = document.createRange(),
                sel = window.getSelection();
            range.setStart(con, chars);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return -1;
        } else {
            chars -= con.textContent.length;
            return chars;
        }
    }
    // check for br and count as 1
    if (con.tagName === 'BR') {
        if (chars === 1) {
            return -2;
        } else {
            return chars - 1;
        }
    } else {
        for (let i = 0; i < con.childNodes.length; i++) {
            chars = SetCurrentCursorPosition(con.childNodes[i], chars);
            if (chars === -1) {
                return -1;
            } else if (chars === -2) {
                con.parentNode.focus();
                let range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(con, 1);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return -1;
            }
        }
        return chars;
    }
}


eel.expose(send_data);

/**
 *
 * @param data a list of matches
 * each match is a list of groups
 * each group is a list of tuples
 * each tuple is a list of text and indexes
 * each index is a list of start and end index
 */
function send_data(data) {
    // text_input.html
    let new_html = get_as_html_new(text_input.innerText, data);
    // result.innerHTML = new_html;
    // let new_html = '';
    // if (data.length > 0) {
    //     let text = text_input.innerText;
    //     for (let i = 0; i < data.length; i++) {
    //         if (i === 0) {
    //             new_html += text.slice(0, data[i][0][1][0]);
    //         } else {
    //             new_html += text.slice(data[i - 1][0][1][1], data[i][0][1][0]);
    //         }
    //         new_html += '<span class="my_' + (0 % 10) + '">';
    //         new_html += text.slice(data[i][0][1][0], data[i][0][1][1]);
    //         new_html += '</span>';
    //     }
    //     new_html += text.slice(data[data.length - 1][0][1][1], text.length);
    // } else {
    //     new_html = text_input.innerText;
    // }
    // if (!new_html.endsWith('\n')) {
    //     new_html += '<span class="my_br"><br/></span>';
    // }
    new_html = new_html.replaceAll('\u200C', '');
    new_html = new_html.replaceAll('\n', '<span class="my_br"><br/></span>');
    if (text_input.innerHTML !== new_html) {
        let [focus, chars] = getCurrentCursorPosition(text_input);
        // let restore = saveCaretPosition(text_input);
        text_input.innerHTML = new_html;
        // restore();
        if (focus) {
            SetCurrentCursorPosition(text_input, chars);
        }
    }
    // result html
    // ===========
    new_html = ''
    for (let i = 0; i < data.length; i++) {
        new_html += '<div class="rounded m-3 border border-1 border-light"><b>MATCH ' + (i) + '</b><br>';
        for (let j = 0; j < data[i].length; j++) {
            new_html += '<div class="rounded m-2 my_border' + (j % 10) + '"> GROUP ' + (j) + (j === 0 ? ' (BASE GROUP)' : '') + '<br>';
            new_html += data[i][j][0];
            new_html += '</div>';
        }
        new_html += '</div>';
    }
    result.innerHTML = new_html;
}
