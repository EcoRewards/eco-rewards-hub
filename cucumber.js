let common = [
    'bdd/feature/**/*.feature',
    '--require-module ts-node/register',
    '--require bdd/cucumber/**/*.ts',
    '--format progress-bar',
    '--format @cucumber/pretty-formatter',
    '--tags "not @skipped and not @pending"',
    '--parallel 2'
].join(' ');

module.exports = {
    default: common
};
