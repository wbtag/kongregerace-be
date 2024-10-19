module.exports = async function (context, req) {
    const gifts = [
        {
            "id": "ec1bae85-c600-4bfe-8369-0b68421406f4",
            "name": "Kropenka na stěnu",
            "link": "https://www.eshop-proecclesia.cz/Kropenka-andel-polyresinova-d1092.htm",
            "reserved": false
        },
        {
            "id": "f548b211-6703-4d4f-9270-b9b9221fd4c4",
            "name": "Stolní hra War of the Ring",
            "link": "https://www.ludopolis.cz/cz/war-of-the-ring-core-set-2nd-edition/",
            "reserved": true
        },
        {
            "id": "43545156-af36-4959-ada5-56562ffc3d36",
            "name": "Word on Fire Bible II - Acts, Letters, and Revelation (kůže)",
            "link": "https://bookstore.wordonfire.org/products/the-word-on-fire-bible-volume-ii?variant=39431197163577",
            "reserved": false
        }
    ]

    context.res = {
        status: 200,
        body: gifts,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}