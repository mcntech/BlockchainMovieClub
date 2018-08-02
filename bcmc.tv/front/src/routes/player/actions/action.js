export const AddItem = (data) => ({
	type: "ADD_ITEM",
	item: data.item,
	itemId:data.id,
	account: data.account
})

export const RemItem = (data) => ({
	type: "REM_ITEM",
	itemId: data.id
})

/* Used only by actions for sockets */
export const initialItems = (res) => ({
	type: "INITIAL_ITEMS",
	items: res
})


export const itemsHasErrored = (bool) => ({
        type: 'ITEMS_HAS_ERRORED',
        hasErrored: bool
})

export const itemsIsLoading = (bool) => ({
        type: 'ITEMS_IS_LOADING',
        isLoading: bool
})


export const itemsFetchDataSuccess = (items) => ({
        type: 'ITEMS_FETCH_DATA_SUCCESS',
        items
})

/***************************************************************************************** */
/* Async Action items using - Sockets													   */
/***************************************************************************************** */
export const loadInitialDataSocket = (socket) => {
	return (dispatch) => {
		// dispatch(clearAllItems())
		socket.on('initialList',(res)=>{
		   console.dir(res)
		   dispatch(initialItems(res))
	   })
	}	
}

export const addNewItemSocket = (socket,id,item) => {
	return (dispatch) => {
		let postData = {
				id:id+1,
				item:item,
		     }
	    socket.emit('addItem',postData)		
	}	
}

export const remItemRemSocket = (socket,id) => {
	return (dispatch) => {
		let postData = {
				id:id
		     }
		socket.emit('remItem',postData)
	}	
}



export const itemsFetchData = (url) => {
    return (dispatch) => {
        dispatch(itemsIsLoading(true));

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }

                dispatch(itemsIsLoading(false));

                return response;
            })
            .then((response) => response.json())
            .then((items) => dispatch(itemsFetchDataSuccess(items)))
            .catch(() => dispatch(itemsHasErrored(true)));
    };
}