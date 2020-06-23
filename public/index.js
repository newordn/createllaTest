const parseDate = (date) => {
  const oldDate = Date.parse(date);
  const nowDate = Date.now();
  const sevenDaysMill = 604800;
  const ellipsedTime = nowDate - oldDate;
  if (ellipsedTime > sevenDaysMill) {
    const d = new Date(oldDate);
    const year = d.getFullYear();
    const month = d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth();
    const days = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
    return `${year}-${month}-${days}`;
  } else {
    const day = ellipsedTime / sevenDaysMill;
    return `${day} ${day > 1 ? "days" : "day"} ago`;
  }
};
const parsePrice = (p) => (p * 1.0) / 100.0;

const Item = ({ face, price, date, size }) => (
  <div className="col-12 col-sm-3 mb-3">
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
  <div className="alert alert-primary w-100 text-center ">
    {" "}
    <span className="font-weight-bold blink-me">Loading ...</span>
  </div>
);

class App extends React.Component {
  state = {
    data: [],
    loading: false,
    sorts : [false,false,false]
  };
  query = async (page=1,sort="")=>{
    this.setState({loading:true})
    let result 
     sort===""?result = await fetch(`/api/products?_page=${page}&_limit=20`)
     :
     result = await fetch(`/api/products?_page=${page}&_limit=20&_sort=${sort}`)
    const data = await result.json()
    this.setState({  loading: false });
    return data
  }
  async componentDidMount() {
    const data = await this.query()
   this.setState({data}) 
  }
  _sort = async (index)=>{
      this.setState({sorts:this.state.sorts.map((sort,i)=>index===i)})
      const sort = index===0?'size':index===1?'price':index===2?'id':'id'
      const data = await this.query(1,sort)
      this.setState({data}) 
  }
  render() {
    const { data, loading ,sorts} = this.state;
    return (
      <div>
        <div className=" my-card d-flex justify-content-center align-items-center mb-3 flex-row p-3 mb-5">
          <button className={`btn ${sorts[0]?"btn-primary":"btn-secondary"}`} onClick={()=>this._sort(0)}>
            Size&nbsp; <i className="fa fa-chevron-up text-light"></i>
          </button>
          &nbsp;&nbsp;&nbsp;&nbsp;{" "}
          <button className={`btn ${sorts[1]?"btn-primary":"btn-secondary"}`} onClick={()=>this._sort(1)}>
            Price <i className="fa fa-chevron-up text-light"></i>
          </button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button className={`btn ${sorts[2]?"btn-primary":"btn-secondary"}`} onClick={()=>this._sort(2)}>
            Id&nbsp;&nbsp;&nbsp;&nbsp;
            <i className="fa fa-chevron-up text-light"></i>
          </button>
        </div>
        <div className="row">
        {loading && <Loader />}
          {data.map((item) => (
            <Item
              face={item.face}
              price={item.price}
              date={item.date}
              size={item.size}
            />
          ))}
          
        </div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
