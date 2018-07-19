pragma solidity ^0.4.0;

contract bcmc
{

    struct Movie {      
    	string   url;
        uint     price;
        uint     duration;
	    uint     rating;
	    uint     viewers;
    }

    struct Advert {
   	    string   url;
        uint     budget;
        uint     duration;
        uint     viewers;
    }

    struct Player {
        uint     preference;
        uint     capabilities;
	    address  crnt_movie;
        uint     indx_advert;
    }

    struct Sponsor {
	    bool      open;
	    uint      funding_start_time;
	    uint      funding_end_time;
	    uint      movie_start_time;
        address   movie;
	    address[] adverts;
    }

    mapping(address => Player) players;
    mapping(address => Movie) movies;
    mapping(address => Advert) adverts;
    
    mapping(address => Sponsor) sponsors;
    
    
    address  owner;

    constructor() public {
        owner = msg.sender;
    }
    
    function registerMovie(string _url, uint _price, uint _duration) public {
    	Movie memory movie = Movie({url:_url, price:_price, duration:_duration, rating:0, viewers:0});
	    movies[msg.sender] = movie;	    
    }

    function registerPlayer(uint _preference, uint _capabilities) public {
    	Player memory player = Player({preference:_preference, capabilities:_capabilities, crnt_movie:0, indx_advert:0});
	    players[msg.sender] = player;
    }

    function registerAdvert(string url, uint budget, uint duration) public {
    	Advert memory advert = Advert(url, budget, duration, 0);
	    adverts[msg.sender] = advert;
    }

    function changePrice(address movie_addr, uint _price) public {
	Movie movie = movies[movie_addr];
        movie.price = _price;
    }

    function getPrice(address movie_addr) public  constant returns (uint _price) {
	Movie movie = movies[movie_addr];
        _price = movie.price;
    }

    function openFunding(address movie_addr, uint _funding_start_time, uint _funding_end_time, uint _movie_start_time) public  {
    
	    Sponsor memory sponsor = Sponsor({open:true, funding_start_time:_funding_start_time, funding_end_time:_funding_end_time, movie_start_time:_movie_start_time, movie:0, adverts:new address[](0)});
        sponsors[movie_addr] = sponsor;
    }
    
    function closeFunding(address movie_addr) public  {
    
	    Sponsor sponsor = sponsors[movie_addr];
        sponsor.open = false;
    }
    
    function addSponsor(address movie_addr) public  {
	    Sponsor sponsor = sponsors[movie_addr];
        sponsor.adverts.push(msg.sender);
    }


    function getMovieUrl(address movie_addr) public constant returns(string url) {
        Player storage player = players[msg.sender];
	    Movie movie = movies[movie_addr];
	    url = movie.url;
    }


    function getNextAdvertUrl(address movie_addr) public constant returns (string _url) {
        Player storage player = players[msg.sender];
        Sponsor storage sponsor = sponsors[movie_addr];
        
        if(sponsor.adverts.length == 0) throw;
        
       uint indx_advert = (player.indx_advert + 1) % sponsor.adverts.length;
        address advert_address= sponsor.adverts[indx_advert];
        Advert advert = adverts[advert_address];
        _url = advert.url;
    }

    function setRating(address movie_addr, uint8 _rating) public  {
        Movie movie = movies[movie_addr];
        movie.rating = (movie.rating * movie.viewers +  _rating) / (movie.viewers + 1);
	    movie.viewers += 1;
    }
    
    function getRating(address movie_addr) public  constant returns (uint rating) {
        Movie movie = movies[movie_addr];        
	    rating = movie.rating;
    }
    
}
