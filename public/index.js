const parseDate = () => "3 days ago";
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
          <span className="font-weight-bold text-primary">${price}</span>
        </div>
        <div>
          <span className=" font-italic">{parseDate(date)}</span>
        </div>
      </div>
    </div>
  </div>
);
const Loader = ()=><div className="alert alert-primary w-100 text-center "> <span className="font-weight-bold blink-me">Loading ...</span></div>
class App extends React.Component {
  state = {
    data: [],
    loading:true
  };
  async componentDidMount() {
    const result = await fetch("/api/products?_page=1&_limit=20");
    const data = await result.json();
    this.setState({ data,loading:false });
  }
  render() {
    const { data ,loading} = this.state;
    return (
      <div className="row">
        {data.map((item) => (
          <Item
            face={item.face}
            price={item.price}
            date={item.date}
            size={item.size}
          />
        ))}
        {loading&&<Loader/>}
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
