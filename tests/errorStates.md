Possible error states to test:

~~* RSVP not found~~
~~* Gift already reserved~~
* RSVP ID conflict - how to check?
* Parameter mismatch - validate on FE
    * ownGift true, giftId null 
    * ownGift false, giftId not null
    * hasCompany true, accompanyingGuestName null
    * hasCompany false, accompanyingGuestName not null  