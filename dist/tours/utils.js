import { TourUtils } from 'tdp_core';
/**
 * Set the next button to active after the promise is resolved
 * @example
 * waitFor: ()=> TourUtils.wait(500).then(setNextActive)
 */
export const setNextActive = async () => 'enable';
/**
 * Clicks the add column button and prevents the score list from closing
 */
export function openAddColumPanel() {
    TourUtils.click('.viewWrapper.t-focus .lu-side-panel-wrapper .lu-adder > button');
    document.querySelector('.viewWrapper.t-focus .lu-search-input').onblur = (ev) => ev.preventDefault();
}
//# sourceMappingURL=utils.js.map