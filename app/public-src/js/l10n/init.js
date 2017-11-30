/* globals $ */

String.defaultLocale = 'zh';

$.fn.classList = function () { return this[0].className.split(/\s+/); };

const l = (format, ...params) => {
  let fmt = format.toLocaleString();
  return fmt.replace(/{(\d+)}/g, (match, number) => {
    return typeof params[number] !== 'undefined'
      ? params[number]
      : match;
  });
};

const l10nPrefix = '_l_';
$(`[class^='${l10nPrefix}']`).each(function () {
  let elem = $(this);
  elem.classList().forEach((cls) => {
    if (cls.substr(0, l10nPrefix.length) === l10nPrefix) {
      elem.text(l(`%${cls.substr(l10nPrefix.length)}`));
    }
  });
});

const l10nPrefixUnescaped = '_lu_';
$(`[class^='${l10nPrefixUnescaped}']`).each(function () {
  let elem = $(this);
  elem.classList().forEach((cls) => {
    if (cls.substr(0, l10nPrefixUnescaped.length) === l10nPrefixUnescaped) {
      elem.html(l(`%${cls.substr(l10nPrefixUnescaped.length)}`));
    }
  });
});

$('[data-translate]').each(function () {
  let elem = $(this);
  elem.data('translate').split('|').forEach((pair) => {
    let [attr, key] = pair.split(',');
    elem.attr(attr, l(`%${key}`));
  });
});

$('title').text(`${l(`%${$('title').text()}`)}`);
