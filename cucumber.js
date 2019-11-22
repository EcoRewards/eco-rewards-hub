let common = [
    'bdd/feature/**/*.feature',
    '--require-module ts-node/register',
    '--require bdd/cucumber/**/*.ts',
    '--format progress-bar',
    '--format node_modules/cucumber-pretty',
    '--tags "not @skipped and not @pending"',
    '--parallel 2'
].join(' ');

module.exports = {
    default: common
};
