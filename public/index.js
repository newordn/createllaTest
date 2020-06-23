/* helper functions (parseDate, parsePrice)*/
const parseDate = (date) => {
  // we are getting the ellipsed time
  const oldDate = Date.parse(date);
  const nowDate = Date.now();
  const sevenDaysMill = 604800000;
  const ellipsedTime = nowDate - oldDate;
  // we check if is it older than 7 days, if it's we just diplaying the pretty formated date
  if (ellipsedTime > sevenDaysMill) {
    const d = new Date(oldDate);
    const year = d.getFullYear();
    const m = d.getMonth() + 1;
    const month = m < 10 ? `0${m}` : m;
    const days = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
    return `${year}-${month}-${days}`;
  }
  // if not, we calculate the number of days into ellipsedTime
  else {
    const day = Math.round(ellipsedTime / 86400000);
    return `${day} ${day > 1 ? "days" : "day"} ago`;
  }
};
const parsePrice = (p) => (p * 1.0) / 100.0;
/* helper functions (parseDate, parsePrice)*/

/* useful component (Item and loader)*/
const Item = ({ face, price, date, size }) => (
  <div className="col-12 col-sm-3 mb-4">
    <div className="my-card p-4">
      <p className="text-center">
        <span className="font-weight-bold" style={{ fontSize: size }}>
          {face}
        </span>
      </p>
      <div className="d-flex flex-row justify-content-between align-items-center">
        <div>
          <span className="font-weight-bold text-primary">
            ${parsePrice(price)}
          </span>
        </div>
        <div>
          <span
            className=" font-italic font-weight-bold"
            style={{ fontSize: "0.8rem" }}
          >
            {parseDate(date)}
          </span>
        </div>
      </div>
    </div>
  </div>
);
const Loader = () => (
  <div className="w-100 pr-3 pl-3"><div className="alert alert-primary  mb-3 text-center ">
    {" "}
    <span className="font-weight-bold blink-me">Loading ...</span>
  </div>
  </div>
);
/* useful component */

/* main component */
class App extends React.Component {
  state = {
    data: [],
    newData:[1], // we are going to save here the newest fetching data, we declared it with one element to avoit end of catalogue to be displayed
    loading: false,
    sorts: [false, false, false], // to handle sorting
    currentPage: 1,
    sort: "",
    flag:true, // am i able to start fetching?,
    ads: []  // to handle ads
  };
  constructor(props) {
    super(props);
    this.container = React.createRef();
  }
  // to generate a random number which is not in the ads array yet
  _uniqueRandom = ()=>{
   const r= Math.floor(Math.random()*1000)
   if(ads.includes(r)){
       this._uniqueRandom()
   }
   return r
  }
  // we use this function to query the api
  query = async (page = 1, sort = this.state.sort) => {
    this.setState({ loading: true });
    let result;
    sort === ""
      ? (result = await fetch(`/api/products?_page=${page}&_limit=20`))
      : (result = await fetch(
          `/api/products?_page=${page}&_limit=20&_sort=${sort}`
        ));
    const data = await result.json();
    const r = this._uniqueRandom() 
    this.setState({ loading: false, ads:[...this.state.ads,r] });
    return data;
  };

  async componentDidMount() {
    window.addEventListener("scroll", this.handleScroll, true);
    const data = await this.query();
    this.setState({ data });
  }
  
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
    
  // we use this function to sort by price,size and id
  _sort = async (index) => {
    this.setState({ sorts: this.state.sorts.map((sort, i) => index === i) });
    const sort =
      index === 0 ? "size" : index === 1 ? "price" : index === 2 ? "id" : "id";
    const data = await this.query(1, sort);
    this.setState({ data,sort });
  };

  /* for automatically load more data on scroll, we use debounce to avoid multiple 
  call of handleScroll
   in a short timeframe(<2s)
   */
  handleScroll = _.debounce(async () => {
      let data = []
      // before we arrive at the bottom(around the half) of the screen we start fetching the data
      console.log(document.body.offsetHeight-window.scrollY,window.innerHeight)
      if(((document.body.offsetHeight-window.scrollY)<= window.innerHeight*2)&&this.state.newData.length&&this.state.flag)
      {
        data = await this.query(this.state.currentPage+1,this.state.sort)
        console.log('fetch')
        this.setState({flag:false})
      }
    // when we arrive at the bottom of the screen we set the queried data
    if(((window.innerHeight + window.scrollY) == (document.body.offsetHeight))&&this.state.newData.length){  
      this.setState({newData: data,data:[...this.state.data,...data],currentPage: this.state.currentPage+1,flag:true})
    }
  },500);

  render() {
    const { data, loading, sorts,newData } = this.state;
    return (
      <div>
        <div className=" my-card p-3 mb-5 d-flex flex-column justify-content-center align-items-center">
          <h4 className="text-center mb-3">Sort By</h4>
          <div className=" d-flex justify-content-center align-items-center flex-row  ">
            <button
              className={`sort-btn btn ${
                sorts[0] ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => this._sort(0)}
            >
              <i class="fas fa-sort-amount-up"></i>{" "}
              Size&nbsp; <i className="fa fa-chevron-up text-light"></i>
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;{" "}
            <button
              className={`sort-btn  btn ${
                sorts[1] ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => this._sort(1)}
            >
              <i className="fa fa-dollar-sign"></i> {" "}Price{" "}
              <i className="fa fa-chevron-up text-light"></i>
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button
              className={`sort-btn  btn ${
                sorts[2] ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => this._sort(2)}
            ><i class="fa fa-sort-numeric-up"></i>{" "}
              Id&nbsp;&nbsp;&nbsp;&nbsp;
              <i className="fa fa-chevron-up text-light"></i>
            </button>
          </div>
        </div>
       {/* we are displaying produtcs here */}
        <div className="row" ref={this.container}>
          {data.map((item) => (
            <Item
              face={item.face}
              price={item.price}
              date={item.date}
              size={item.size}
            />
          ))}
          
          {loading && <Loader />}
          {newData.length === 0 && (
            <div className="w-100 pr-3 pl-3">
            <div className="alert mt-2 mt-2 alert-danger  text-center font-weight-bold">
              ~ end of catalogue ~
            </div>
            </div>
          )}
        </div>
        
        {/* we are displaying ads here */}
        <div className="row text-center">
            <img className="img-fluid" alt="" src={`/ads/?r=${currentPage}`}
        </div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
