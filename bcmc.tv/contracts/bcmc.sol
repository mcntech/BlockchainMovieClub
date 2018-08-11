pragma solidity ^0.4.24;

/// @title ERC-173 Contract Ownership Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-173.md
///  Note: the ERC-165 identifier for this interface is 0x7f5828d0
interface ERC173 /* is ERC165 */ {
    /// @dev This emits when ownership of a contract changes.    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @notice Get the address of the owner    
    /// @return The address of the owner.
    function owner() view external;
	
    /// @notice Set the address of the new owner of the contract   
    /// @param _newOwner The address of the new owner of the contract    
    function transferOwnership(address _newOwner) external;	
}

/// @title ERC-721 Non-Fungible Token Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
///  Note: the ERC-165 identifier for this interface is 0x80ac58cd.
interface ERC721 /* is ERC165 */ {
    /// @dev This emits when ownership of any NFT changes by any mechanism.
    ///  This event emits when NFTs are created (`from` == 0) and destroyed
    ///  (`to` == 0). Exception: during contract creation, any number of NFTs
    ///  may be created and assigned without emitting Transfer. At the time of
    ///  any transfer, the approved address for that NFT (if any) is reset to none.
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    /// @dev This emits when the approved address for an NFT is changed or
    ///  reaffirmed. The zero address indicates there is no approved address.
    ///  When a Transfer event emits, this also indicates that the approved
    ///  address for that NFT (if any) is reset to none.
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

    /// @dev This emits when an operator is enabled or disabled for an owner.
    ///  The operator can manage all NFTs of the owner.
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /// @notice Count all NFTs assigned to an owner
    /// @dev NFTs assigned to the zero address are considered invalid, and this
    ///  function throws for queries about the zero address.
    /// @param _owner An address for whom to query the balance
    /// @return The number of NFTs owned by `_owner`, possibly zero
    function balanceOf(address _owner) external view returns (uint256);

    /// @notice Find the owner of an NFT
    /// @dev NFTs assigned to zero address are considered invalid, and queries
    ///  about them do throw.
    /// @param _tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT
    function ownerOf(uint256 _tokenId) external view returns (address);

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
    ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
    ///  `onERC721Received` on `_to` and throws if the return value is not
    ///  `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    /// @param data Additional data with no specified format, sent in call to `_to`
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) public;

    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This works identically to the other function with an extra data parameter,
    ///  except this function just sets data to "".
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public;

    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///  THEY MAY BE PERMANENTLY LOST
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(address _from, address _to, uint256 _tokenId) public;

    /// @notice Change or reaffirm the approved address for an NFT
    /// @dev The zero address indicates there is no approved address.
    ///  Throws unless `msg.sender` is the current NFT owner, or an authorized
    ///  operator of the current owner.
    /// @param _approved The new approved NFT controller
    /// @param _tokenId The NFT to approve
    function approve(address _approved, uint256 _tokenId) external payable;

    /// @notice Enable or disable approval for a third party ("operator") to manage
    ///  all of `msg.sender`'s assets
    /// @dev Emits the ApprovalForAll event. The contract MUST allow
    ///  multiple operators per owner.
    /// @param _operator Address to add to the set of authorized operators
    /// @param _approved True if the operator is approved, false to revoke approval
    function setApprovalForAll(address _operator, bool _approved) public;

    /// @notice Get the approved address for a single NFT
    /// @dev Throws if `_tokenId` is not a valid NFT.
    /// @param _tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    function getApproved(uint256 _tokenId) external view returns (address);

    /// @notice Query if an address is an authorized operator for another address
    /// @param _owner The address that owns the NFTs
    /// @param _operator The address that acts on behalf of the owner
    /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

interface ERC165 {
    /// @notice Query if a contract implements an interface
    /// @param interfaceID The interface identifier, as specified in ERC-165
    /// @dev Interface identification is specified in ERC-165. This function
    ///  uses less than 30,000 gas.
    /// @return `true` if the contract implements `interfaceID` and
    ///  `interfaceID` is not 0xffffffff, `false` otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
contract ERC721Receiver {
  /**
   * @dev Magic value to be returned upon successful reception of an NFT
   *  Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`,
   *  which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
   */
  bytes4 internal constant ERC721_RECEIVED = 0x150b7a02;

  /**
   * @notice Handle the receipt of an NFT
   * @dev The ERC721 smart contract calls this function on the recipient
   * after a `safetransfer`. This function MAY throw to revert and reject the
   * transfer. Return of other than the magic value MUST result in the
   * transaction being reverted.
   * Note: the contract address is always the message sender.
   * @param _operator The address which called `safeTransferFrom` function
   * @param _from The address which previously owned the token
   * @param _tokenId The NFT identifier which is being transferred
   * @param _data Additional data with no specified format
   * @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
   */
  function onERC721Received(
    address _operator,
    address _from,
    uint256 _tokenId,
    bytes _data
  )
    public
    returns(bytes4);
}


/// @title ERC-721 Non-Fungible Token Standard, optional metadata extension
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
///  Note: the ERC-165 identifier for this interface is 0x5b5e139f.
interface ERC721Metadata /* is ERC721 */ {
    /// @notice A descriptive name for a collection of NFTs in this contract
    function name() external view returns (string _name);

    /// @notice An abbreviated name for NFTs in this contract
    function symbol() external view returns (string _symbol);

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 _tokenId) external view returns (string);
}

/// @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
///  Note: the ERC-165 identifier for this interface is 0x780e9d63.
interface ERC721Enumerable /* is ERC721 */ {
    /// @notice Count NFTs tracked by this contract
    /// @return A count of valid NFTs tracked by this contract, where each one of
    ///  them has an assigned and queryable owner not equal to the zero address
    function totalSupply() external view returns (uint256);

    /// @notice Enumerate valid NFTs
    /// @dev Throws if `_index` >= `totalSupply()`.
    /// @param _index A counter less than `totalSupply()`
    /// @return The token identifier for the `_index`th NFT,
    ///  (sort order not specified)
    function tokenByIndex(uint256 _index) external view returns (uint256);

    /// @notice Enumerate NFTs assigned to an owner
    /// @dev Throws if `_index` >= `balanceOf(_owner)` or if
    ///  `_owner` is the zero address, representing invalid NFTs.
    /// @param _owner An address where we are interested in NFTs owned by them
    /// @param _index A counter less than `balanceOf(_owner)`
    /// @return The token identifier for the `_index`th NFT assigned to `_owner`,
    ///   (sort order not specified)
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}

contract bcmc is ERC165,  ERC721 , ERC721Receiver /*ERC173, ERC721Metadata, ERC721Enumerable*/
{


   event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
   event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
   event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    bytes4 constant InterfaceSignature_ERC165 = 0x01ffc9a7;
    /*
    bytes4(keccak256('supportsInterface(bytes4)'));
    */

  bytes4 constant InterfaceSignature_ERC721Enumerable = 0x780e9d63;
    /*
    bytes4(keccak256('totalSupply()')) ^
    bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) ^
    bytes4(keccak256('tokenByIndex(uint256)'));
    */

  bytes4 constant InterfaceSignature_ERC721Metadata = 0x5b5e139f;
    /*
    bytes4(keccak256('name()')) ^
    bytes4(keccak256('symbol()')) ^
    bytes4(keccak256('tokenURI(uint256)'));
    */

  bytes4 constant InterfaceSignature_ERC721 = 0x80ac58cd;
    /*
    bytes4(keccak256('balanceOf(address)')) ^
    bytes4(keccak256('ownerOf(uint256)')) ^
    bytes4(keccak256('approve(address,uint256)')) ^
    bytes4(keccak256('getApproved(uint256)')) ^
    bytes4(keccak256('setApprovalForAll(address,bool)')) ^
    bytes4(keccak256('isApprovedForAll(address,address)')) ^
    bytes4(keccak256('transferFrom(address,address,uint256)')) ^
    bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
    bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'));
    */

  bytes4 public constant InterfaceSignature_ERC721Optional =- 0x4f558e79;
    /*
    bytes4(keccak256('exists(uint256)'));
    */

 /**
   * @dev Magic value to be returned upon successful reception of an NFT
   *  Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`,
   *  which can be also obtained as `ERC721Receiver(0).onERC721Received.selector`
   */
  bytes4 internal constant ERC721_RECEIVED = 0x150b7a02;


    /// @notice Name and symbol of the non fungible token, as defined in ERC721.
    string public constant bcmc_name = "BlockchainMovieClub";
    string public constant bcmc_symbol = "BCMC";


    event NewMovie(address owner, uint256 movieId);
    event MovieViewTokenRequested(address drmprovider, address buyer, string buyerkey, uint256 movieid);
    event MovieViewTokenGranted(address player, uint256 movieId);
        
    struct Movie {      
    	string     url;
    	string     thumb;
		string     title;
    	string     descript;
        uint256    price;
        uint32     duration;
		uint32     drmtype;
	    uint32     rating;
	    uint32     viewers;
	    address    drmprovider;
    }

    struct ViewToken {      
    	uint32    movieId;
        uint32    cgms;
        uint32    status;
        string    drm;
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
        string   publickey;
    }

    struct Sponsor {
	    bool      open;
	    uint      funding_start_time;
	    uint      funding_end_time;
	    uint      movie_start_time;
        uint      movie;
	    uint[]    adverts;
    }


	/*** Storage ***/
	
    mapping(address => Player) players;
    //mapping(address => Movie) movies;
    mapping(address => Advert) adverts;
    mapping(address => Sponsor) sponsors;
    
    Movie[] movies;
    
    /// @dev A mapping from movie IDs to the address that owns them. All movies have
    /// some valid owner address.
    mapping(uint256 => address) movieIndexToOwner;

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    mapping (address => uint256) ownershipTokenCount;

    // @dev A mapping from owner address to count of movies that address has viewRight.
    // Used internally inside balanceOf() to resolve viewRight count.
    mapping (address => uint256) viewRightTokenCount;

    /// @dev A mapping from movie IDs to an address that has been approved to view
    /// the movie by obtaining DRM meta data at any time.
    /// A zero value means no approval is outstanding.
    mapping (uint256 => address) public tokenApprovals;
   
    // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) internal operatorApprovals;
   
    /// @dev A mapping from player id to ViewTokens
    mapping (address => mapping (uint256 => ViewToken)) public viewRightGrants;


    address public owner;
    // Values 0-10,000 map to 0%-100%
    uint256 public ownerCut;

    constructor() public {
       owner = msg.sender;
       ownerCut = 500;          // 5%
    }

    modifier onlyOwner() {
       require(msg.sender == owner);
       _;
    }
    

    /// ERC173
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);    
    
    /// @dev method to get owner. automatically provided by getter.
    //function owner() view external;
    //{
    //    return owner;    
    //}
    
    function transferOwnership(address _newOwner) external
    {
        address prevOwner = owner;
        owner = _newOwner;
        OwnershipTransferred(prevOwner, _newOwner);
    }
    
    function setOwnerCut(uint256 _ownerCut) onlyOwner{
        ownerCut = _ownerCut;
    }
     
    /// @dev An method that registers a new movie.
    /// @param _url A json structure locate the movie, cover, title on external network
    /// @param _price price of the pay per view
    /// @param _duration duration of the movie.
    function registerMovie(
    		string _url,
    		string _thumb,
    		string _title,
    		string _descript,
    		uint256 _price, 
    		uint32 _duration,
    		uint32 _drmtype,
    		address _drmprovider) public {
    	
    	Movie memory movie = Movie({
    			url:_url,
    			thumb:_thumb,
    			title:_title,
    			descript:_descript,
    			price:_price, 
    			duration:_duration, 
    			drmtype : _drmtype,
    			rating:0, 
    			viewers:0,
    			drmprovider: _drmprovider});
	    uint256 movieId = movies.push(movie) - 1;
	    //movies[movieId] = movie;	 
	    movieIndexToOwner[movieId] = msg.sender;
	    ownershipTokenCount[msg.sender]++;
    }

    /// @dev set drm provider for a new movie.
	function setDrmProvider(
	    uint256 id, 
	    address _provider) public
	{
		require(id < movies.length && msg.sender == movieIndexToOwner[id]);
		movies[id].drmprovider = _provider;
	}
	
	/// @dev registers a player.
	/// @param _preference - Advertisement preferences 0-none, 0xFF- all. TODO: Each bit defines a preference such as SPORTS
	/// @param _capabilities - Player capabilities resolution 0x000000FF(HD, UHD), audio channels 0x0000FF00, DRM 0x00FF000000
	/// @param _publickey - for obtaining DRM. Content provider uses this key to encrypt DRM information and add it with the
	///        viewing right.
    function registerPlayer(
    		uint _preference, 
    		uint _capabilities,
    		string _publickey) 
    		public 
    {
    	Player memory player = Player({preference:_preference, 
    							capabilities:_capabilities, 
    							crnt_movie:0, 
    							indx_advert:0,
    							publickey:_publickey});
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
    
    /// @dev Computes owner's cut of a sale.
    /// @param _price - Sale price of NFT.
    function _computeCut(uint256 _price) internal view returns (uint256) {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our entry functions carefully cap the maximum values for
        //  currency (at 128-bits), and ownerCut <= 10000 (see the require()
        //  statement in the ClockAuction constructor). The result of this
        //  function is always guaranteed to be <= _price.
        return _price * ownerCut / 10000;
    }

    /// @dev Request viewToken from content provider.
    /// @param id is moveie id set at the time of registratoin
    function requestViewToken(address drmprovider, address buyer, string buyerkey, uint256 id) internal {
        mapping (uint256 => ViewToken) viewTokens = viewRightGrants [buyer];
        
        /// Create a token with drm pending
        ViewToken memory viewToken = ViewToken({movieId:uint32(id), cgms:1, status:1, drm:"pending"});
        viewTokens[id] = viewToken;
        MovieViewTokenRequested(drmprovider, buyer, buyerkey, id);
    }

    /// @dev Grant viewToken for the player.
    /// @param id is moveie id set at the time of registratoin
    function grantViewToken( address buyer, uint256 id, string _drm) public {
        require(id <= movies.length && msg.sender == movies[id].drmprovider);
        mapping (uint256 => ViewToken) viewTokens = viewRightGrants [buyer];
        
        /// Fill the view token with DRM data
        ViewToken memory viewToken = ViewToken({movieId:uint32(id), cgms:1, status:2, drm:_drm});
        viewTokens[id] = viewToken;
        emit MovieViewTokenGranted(buyer, id);
    }
    
    /// @dev Purchase a movie.
    /// @param id is movie id set at the time of registratoin
    function purchaseMovie(uint256 id) public payable
    {
        uint256 _bidAmount = msg.value;
        address buyer = msg.sender;
        
        require(id < movies.length);
        
        Movie storage movie = movies[id];
        Player storage player = players[buyer];
        
        uint256 price = movie.price;
        
        require(_bidAmount >= price);    
        
        address seller = movieIndexToOwner[id];

        // Transfer proceeds to seller (if there are any!)
        if (price > 0) {
            // Calculate the auctioneer's cut.
            // (NOTE: _computeCut() is guaranteed to return a
            // value <= price, so this subtraction can't go negative.)
            uint256 fees = _computeCut(price);
            uint256 sellerProceeds = price - fees;

            seller.transfer(sellerProceeds);
        }

        uint256 bidExcess = _bidAmount - price;
        if(bidExcess > 0){
            msg.sender.transfer(bidExcess);
        }
        // Request view right
        requestViewToken(movie.drmprovider, buyer, player.publickey ,id);
    }

    function getPurchasedMovie(uint256 index) public constant returns (uint32 movieid, uint32 cgms, string drm)
    {
       mapping (uint256 => ViewToken) viewTokens = viewRightGrants[msg.sender];
        ViewToken storage token = viewTokens[index];
        movieid = token.movieId;
        cgms = token.cgms;
        drm = token.drm;
    }

    /// @notice Returns all the relevant information about a specific movie.
    /// @param _id The ID of the interest.
    function getMovieData(uint _id) public constant returns(
    			string _url,
    			string _thumb,
    			string _title,
    			string _descript, 
    			uint256 _price, 
    			uint32 _duration, 
    			uint32 _drmtype,
    			uint32 _drmstatus) {
	    require(_id <= movies.length);
	    _url = movies[_id].url;
	    _thumb = movies[_id].thumb;
	    _title = movies[_id].title;
	    _descript = movies[_id].descript;
	    _price = movies[_id].price;
	    _duration = movies[_id].duration;
	    _drmtype = movies[_id].drmtype;
	    
	    if(movies[_id].drmtype != 0) {
	        mapping (uint256 => ViewToken) viewTokens = viewRightGrants[msg.sender];
	        ViewToken storage viewToken = viewTokens[_id];
	        _drmstatus = viewToken.status;
	    } else {
	    	_drmstatus = 0;
	    }
    }

    function getMovieUrl(uint _id) public constant returns(string _url){
    	_url = movies[_id].url;
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
    function totalMovies() public view returns (uint256) {
        return movies.length;
	}
	
	
	
	
	
	
	
	/// @dev Checks if a given address is the current owner of a movie.
    /// @param _claimant the address we are validating against.
    /// @param _tokenId movie id, only valid
    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return movieIndexToOwner[_tokenId] == _claimant;
    }
	
	
	/// @notice Transfers a movie to another address.
    /// @param _to The address of the recipient, can be a user or contract.
    /// @param _tokenId The ID of the movie to transfer.
    /// @dev Required for ERC-721 compliance.
    function transfer(
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Safety check to prevent against an unexpected 0x0 default.
        require(_to != address(0));
        // Disallow transfers to this contract to prevent accidental misuse.
        require(_to != address(this));
  

        // You can only send your own movie.
        require(_owns(msg.sender, _tokenId));

        // Reassign ownership, clear pending approvals, emit Transfer event.
        _transfer(msg.sender, _to, _tokenId);
    }
	 /// @dev Assigns ownership of a specific movie to an address.
    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        // Since the number of movies is capped to 2^32 we can't overflow this
        ownershipTokenCount[_to]++;
        // transfer ownership
        movieIndexToOwner[_tokenId] = _to;
        ownershipTokenCount[_from]--;
        // Emit the transfer event.
        emit Transfer(_from, _to, _tokenId);
    }
    
    
    
    /// @notice Introspection interface as per ERC-165 (https://github.com/ethereum/EIPs/issues/165).
    ///  Returns true for any standardized interfaces implemented by this contract. We implement
    ///  ERC-165 and ERC-721.
    function supportsInterface(bytes4 _interfaceID) external view returns (bool)
    {
        // DEBUG ONLY
        //require((InterfaceSignature_ERC165 == 0x01ffc9a7) && (InterfaceSignature_ERC721 == 0x9a20483d));

        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
    }
    
    /// @notice Returns the number of movies owned by a specific address.
    /// @param _owner The owner address to check.
    /// @dev Required for ERC-721 compliance
    function balanceOf(address _owner) public view returns (uint256 count) {
        return ownershipTokenCount[_owner];
    }
    
    /// @notice Returns the address currently assigned ownership of a given movie.
    /// @dev Required for ERC-721 compliance.
    function ownerOf(uint256 _tokenId)
        public
        view
        returns (address _owner)
    {
        _owner = movieIndexToOwner[_tokenId];
        require(_owner != address(0));
    }
    
    
    
    /// helper functions for ERC-721 implementatoin of safeTransferFrom
   
    function isApprovedOrOwner(address _spender, uint256 _tokenId) internal view returns (bool result) {
        address tokenOwner = ownerOf(_tokenId);
        result = _spender == tokenOwner || getApproved(_tokenId) == _spender || isApprovedForAll(owner, _spender);
    }
    
    modifier canTransfer(uint256 _tokenId) {
        require(isApprovedOrOwner(msg.sender, _tokenId));
        _;
    }
    
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(addr) }  
        return size > 0;
    }

    function checkAndCallSafeTransfer(address _from, address _to, uint256 _tokenId, bytes _data) internal returns (bool) {
        if (!isContract(_to)) {
              return true;
            
        }
        bytes4 retval = ERC721Receiver(_to).onERC721Received(msg.sender, _to, _tokenId, _data);
        return (retval == ERC721_RECEIVED); 
    }

    /// @dev Required for ERC-721 compliance
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public canTransfer(_tokenId) {
        transferFrom(_from, _to, _tokenId);
        require(checkAndCallSafeTransfer(_from, _to, _tokenId, _data)); 
        
    }


    /// @dev Required for ERC-721 compliance.
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public
    {
        safeTransferFrom(_from, _to, _tokenId, "");
    }
    
    /// @dev Required for ERC-721 compliance.
    function transferFrom(address _from, address _to, uint256 _tokenId) public
    {
        _transfer(_from, _to, _tokenId);
    }
    
    /// @dev Required for ERC-721 compliance.
    function approve(address _to, uint256 _tokenId) public
    {
        address owner = ownerOf(_tokenId);
        require(_to != owner);
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

        tokenApprovals[_tokenId] = _to;
        emit Approval(owner, _to, _tokenId);
    }
    
    /// @dev Required for ERC-721 compliance.
    function setApprovalForAll(address _to, bool _approved) public
    {
        require(_to != msg.sender);
        operatorApprovals[msg.sender][_to] = _approved;
        emit ApprovalForAll(msg.sender, _to, _approved);
    }
    
    /// @dev Required for ERC-721 compliance.
    function getApproved(uint256 _tokenId) public view returns (address)
    {
       return tokenApprovals[_tokenId];
    }
    
    /// @dev Required for ERC-721 compliance.
    function isApprovedForAll(address _owner, address _operator) public view returns (bool)
    {
        return operatorApprovals[_owner][_operator];
    }
    
    // ERC721Metadata
    function name() external view returns (string _name)
    {
        _name = bcmc_name;
    }
    
    /// @dev Required for ERC-721 compliance.
    function symbol() external view returns (string _symbol)
    {
        _symbol = bcmc_symbol;    
    }
    
    /// @dev Required for ERC-721 compliance.
    function tokenURI(uint256 _tokenId) external view returns (string)
    {
        return getMovieUrl(_tokenId);
    }
    
    // ERC721Enumerable
    function totalSupply() external view returns (uint256)
    {
        return totalMovies();
    }
    
    /// @dev Required for ERC-721 compliance.
    function tokenByIndex(uint256 _index) external view returns (uint256 resultToken)
    {
        uint256 totalMovies =  movies.length;

        if(totalMovies > 0 && _index <= totalMovies) {
            resultToken = _index;
        }
        resultToken = 0;
    }
    
    /// @dev Required for ERC-721 compliance.
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256)
    {
        uint256 tokenCount = balanceOf(_owner);
        uint256 result = 0;
        if (tokenCount == 0) {
            // Return an empty array
            return result;
        } else {
            uint256 totalMovies =  movies.length;
            uint256 resultIndex = 0;

            uint256 id;

            for (id = 0; id < totalMovies; id++) {
                if (movieIndexToOwner[id] == _owner) {
                    result = id;
                    break;
                }
            }
            return result;
        }
    }


    /// ERC721TokenReceiver
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) public returns(bytes4)
    {
       //return bytes4(keccak256("onERC721Received(address,uint256,bytes)"));
       return ERC721_RECEIVED;
       
    }
}
