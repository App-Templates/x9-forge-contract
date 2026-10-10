import { expect, it } from 'vitest';
import { findModelConsumerDefinition, registeredModelConsumerDefinitions, registeredModelConsumers } from '../../src/model-router/index.js';
it('declares only the real Lab digest reader, retaining the existing consumer inventory', () => {
  expect(findModelConsumerDefinition('lab_digest')).toMatchObject({slotId:'lab_digest',capability:'lab',function:'reasoning',requirements:{tools:false,stream:false,structuredOutput:true},inventoryIds:['C35'],scope:'agent',changeBoundary:'next-call',routing:'single'});
  expect(findModelConsumerDefinition('lab_read')).toBeUndefined();
  expect(registeredModelConsumers()).toHaveLength(35);
  expect(registeredModelConsumerDefinitions().slice(0,34).map(row => row.inventoryIds[0])).toEqual(Array.from({length:34},(_,index)=>'C'+String(index+1).padStart(2,'0')));
});
