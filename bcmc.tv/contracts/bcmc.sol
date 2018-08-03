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
        uint      movie;
	    uint[]    adverts;
    }

    mapping(address => Player) players;
    //mapping(address => Movie) movies;
    mapping(address => Advert) adverts;
    mapping(address => Sponsor) sponsors;
    
    Movie[] movies;
    
    /// @dev A mapping from movie IDs to the address that owns them. All movies have
    /// some valid owner address.
    mapping(uint256 => address) movieIndexToOwner;

    
    address  owner;
    constructor() public {
        owner = msg.sender;
    }
    
    
    /// @dev An method that registers a new movie.
    /// @param _url A json structure locate the movie, cover, title on external network
    /// @param _price price of the pay per view
    /// @param _duration duration of the movie.
    function registerMovie(
    		string _url,
    		uint _price, 
    		uint _duration) public {
    	
    	Movie memory movie = Movie({
    			url:_url,
    			price:_price, 
    			duration:_duration, 
    			rating:0, viewers:0});
	    uint256 movieId = movies.push(movie) - 1;
	    movies[movieId] = movie;	 
	    movieIndexToOwner[movieId] = msg.sender;
	       
    }

    function registerPlayer(uint _preference, uint _capabilities) public {
    	Player memory player = Player({preference:_preference, capabilities:_capabilities, crnt_movie:0, indx_advert:0});
	    players[msg.sender] = player;
    }

    function registerAdvert(string url, uint budget, uint duration) public {
    	Advert memory advert = Advert(url, budget, duration, 0);
	    adverts[msg.sender] = advert;
    }

    function changePrice(uint _id, uint _price) public {
        movies[_id].price = _price;
    }

    function getPrice(uint _id) public  constant returns (uint _price) {
        _price = movies[_id].price;
    }

    function openFunding(uint _id, uint _funding_start_time, uint _funding_end_time, uint _movie_start_time) public  {
    
        // TODO
	    //Sponsor memory sponsor = Sponsor({open:true, funding_start_time:_funding_start_time, funding_end_time:_funding_end_time, movie_start_time:_movie_start_time, movie:0, adverts:new address[](0)});
        //sponsors[_id] = sponsor;
    }
    
    function closeFunding(address movie_addr) public  {
    
	    Sponsor storage sponsor = sponsors[movie_addr];
        sponsor.open = false;
    }
    
    function addSponsor(uint _id) public  {
	    //TODO
	    //Sponsor storage sponsor = sponsors[_id];
        //sponsor.adverts.push(msg.sender);
    }


    /// @notice Returns all the relevant information about a specific movie.
    /// @param _id The ID of the interest.
    function getMovieUrl(uint _id) public constant returns(string url) {
	    url = movies[_id].url;
    }

    
    function getNextAdvertUrl(uint _id) public constant returns (string _url) {
        //TODO
        //Player storage player = players[msg.sender];
        //Sponsor storage sponsor = sponsors[_id];
        //
        //if(sponsor.adverts.length == 0) revert();
        
       //uint indx_advert = (player.indx_advert + 1) % sponsor.adverts.length;
        //address advert_address= sponsor.adverts[indx_advert];
        //Advert storage advert = adverts[advert_address];
        //_url = advert.url;
    }

    function setRating(uint _id, uint8 _rating) public  {
        Movie storage movie = movies[_id];
        movie.rating = (movie.rating * movie.viewers +  _rating) / (movie.viewers + 1);
	    movie.viewers += 1;
    }
    
    function getRating(uint _id) public  constant returns (uint rating) {
	    rating = movies[_id].rating;
    }
    
    /// @notice Returns the total number of movies.
    /// @dev Required for ERC-721 compliance.
    function totalMovies() public view returns (uint) {
        return movies.length;
	}
}
