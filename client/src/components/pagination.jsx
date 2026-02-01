const Navigation = ({currentPage=1, previousPage=1, hasPreviousPage=false, hasNextPage=true, lastPage=4, nextPage=true })=> {

    return (
           <section className="pagination">
            { (currentPage!==1 && previousPage !==1) && <a href="?page=1">1</a> }
                <a href={`?page=${currentPage}`} className="active">{currentPage}</a>
            {hasPreviousPage && <a href="?page=<%= previousPage %>">{ previousPage}</a> }
                {hasNextPage && <a href={`?page=${nextPage}`}>{nextPage}</a>}
                {(lastPage != currentPage && lastPage!= nextPage ) && <a href={`?page=${lastPage}`}>{lastPage}</a> }
            </section>
    );
}

export default Navigation;