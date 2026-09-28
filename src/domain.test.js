import {describe, expect, it} from 'vitest';
import {decideSeat, validateEvent, validateRsvp} from './domain.js';
const future='2099-10-24';
describe('event input boundaries',()=>{
 it('rejects unusual capacity values',()=>{for(const capacity of ['NaN','Infinity','1.5','-1','100001','']) expect(validateEvent({title:'Valid title',location:'Hall',capacity,date:future,time:'10:00',end:'11:00'}).ok).toBe(false)});
 it('rejects invalid calendar times and reversed time ranges',()=>{expect(validateEvent({title:'Valid title',location:'Hall',capacity:20,date:'2099-02-31',time:'10:00',end:'11:00'}).ok).toBe(false);expect(validateEvent({title:'Valid title',location:'Hall',capacity:20,date:future,time:'11:00',end:'10:00'}).ok).toBe(false)});
 it('trims benign surrounding whitespace',()=>{expect(validateEvent({title:' A valid title ',location:' Hall ',capacity:20,date:future,time:'10:00',end:'11:00'}).value.title).toBe('A valid title')});
});
describe('RSVP and capacity rules',()=>{
 it('rejects invalid answer, negative, fractional, or excessive guest counts',()=>{expect(validateRsvp({answer:'admin',guests:0}).ok).toBe(false);for(const guests of [-1,1.5,21,Number.NaN,Number.POSITIVE_INFINITY])expect(validateRsvp({answer:'Going',guests,plusOnesAllowed:20}).ok).toBe(false)});
 it('rejects guests beyond the invite and RSVP after deadline',()=>{expect(validateRsvp({answer:'Going',guests:2,plusOnesAllowed:1}).ok).toBe(false);expect(validateRsvp({answer:'Going',deadline:'2020-01-01',now:new Date('2021-01-01')}).ok).toBe(false)});
 it('allocates the final seat once and waitlists overflow',()=>{expect(decideSeat({capacity:100,confirmedGuests:99,requestedGuests:1}).status).toBe('Going');expect(decideSeat({capacity:100,confirmedGuests:100,requestedGuests:1}).status).toBe('Waitlisted')});
 it('does not charge a seat again when an existing Going response is edited',()=>{expect(decideSeat({capacity:1,confirmedGuests:1,requestedGuests:1,previousAnswer:'Going'}).status).toBe('Going')});
});
