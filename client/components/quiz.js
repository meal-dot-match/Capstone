import React from 'react'
import {CuttingBoard, MaxMessage, ProgressBar} from './index'
import axios from 'axios'
import {ListGroup, Container, Row, Col, Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'

export default class Quiz extends React.Component {
  constructor() {
    super()
    this.state = {
      count: 0,
      meal: '',
      meats: [],
      seafood: [],
      dairy: [],
      'vegetable(s)': [],
      'fruit(s)': [],
      'grain(s)': [],
      ingredients: [],
      data: [],
      alert: false,
      skipNext: 'Skip'
    }
    this.removeIngredient = this.removeIngredient.bind(this)
    this.increaseCount = this.increaseCount.bind(this)
    this.decreaseCount = this.decreaseCount.bind(this)
    this.addToIngredients = this.addToIngredients.bind(this)
  }

  async componentDidMount() {
    const {data} = await axios.get('/api/questions')
    this.setState({data: data})
  }

  addToIngredients(event) {
    let max = this.state.data[this.state.count].max
    let foodType = this.state.data[this.state.count].question.split(' ')[1]
    let foodTypeLength = this.state[foodType].length
    let meatSeafoodLength = this.state.meats.length + this.state.seafood.length
    // if we are on meals, set meal
    if (this.state.count === 0) {
      this.setState({
        meal: event.target.alt,
        skipNext: 'Next'
      })
    } else if (
      !this.state.ingredients.includes(event.target.alt) &&
      foodTypeLength < max
    ) {
      if (foodType === 'meats' || foodType === 'seafood') {
        if (meatSeafoodLength < 2) {
          this.setState({
            ingredients: [...this.state.ingredients, event.target.alt],
            [foodType]: [...this.state[foodType], event.target.alt],
            skipNext: 'Next'
          })
        }
      } else {
        this.setState({
          ingredients: [...this.state.ingredients, event.target.alt],
          [foodType]: [...this.state[foodType], event.target.alt],
          skipNext: 'Next'
        })
      }
    } else if (foodTypeLength === max || meatSeafoodLength === 2) {
      this.setState({
        alert: true
      })
    }
  }

  removeIngredient(event) {
    const ingredientsLeft = this.state.ingredients.filter(item => {
      return item !== event.target.id
    })
    const foodType = this.state.data[this.state.count].question.split(' ')[1]
    const foodTypeIngredientsLeft = this.state[foodType].filter(item => {
      return item !== event.target.id
    })
    this.setState({
      ingredients: ingredientsLeft,
      [foodType]: foodTypeIngredientsLeft,
      alert: false
    })
  }

  increaseCount() {
    let newCount = this.state.count + 1
    let foodType = this.state.data[this.state.count].question.split(' ')[1]

    if (foodType === 'meats') {
      this.setState({count: newCount, skipNext: 'Skip'})
    } else {
      this.setState({
        count: newCount,
        alert: false,
        skipNext: 'Skip'
      })
    }
  }

  decreaseCount() {
    let newCount = this.state.count - 1
    let foodType = this.state.data[this.state.count].question.split(' ')[1]

    if (foodType === 'seafood') {
      this.setState({count: newCount})
    } else {
      this.setState({
        count: newCount,
        alert: false
      })
    }
  }

  render() {
    const questions = this.state.data[this.state.count]

    return this.state.data[0] ? (
      <Container>
        <Row>
          <Col>
            <ProgressBar count={this.state.count} />
            <h2 className="question">{questions.question}</h2>
            <MaxMessage
              max={this.state.data[this.state.count].max}
              foodType={
                this.state.data[this.state.count].question.split(' ')[1]
              }
              alert={this.state.alert}
            />
            <Row>
              {questions.image.map((picture, index) => {
                return (
                  <div key={Math.random()}>
                    <button
                      type="button"
                      className="button"
                      onClick={() => this.addToIngredients(event)}
                    >
                      <div className="option-with-label">
                        <div className="label">{questions.name[index]}</div>
                        <div>
                          <img
                            className="options"
                            src={picture}
                            alt={questions.name[index]}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </Row>

            <Row className="prev-next-buttons">
              <div>
                {this.state.count > 0 ? (
                  <Button
                    className="skipNextPrevButtons"
                    onClick={() => this.decreaseCount()}
                  >
                    Previous
                  </Button>
                ) : null}
                {'        '}
                {this.state.count === this.state.data.length - 1 ? null : (
                  <Button
                    className="skipNextPrevButtons"
                    onClick={() => this.increaseCount()}
                  >
                    {this.state.skipNext}
                  </Button>
                )}
              </div>
            </Row>
            <Row>
              <Link
                to={{
                  pathname: '/results',
                  state: {
                    theIngredients: this.state.ingredients,
                    theMeats: this.state.meats,
                    theSeafood: this.state.seafood
                  }
                }}
              >
                <Button className="btn-responsive" size="lg" id="matchMe">
                  Match Me
                </Button>
              </Link>
            </Row>
          </Col>
          <Col sm={5}>
            <CuttingBoard
              sendFunction={this.removeIngredient}
              ingredients={this.state.ingredients}
              meal={this.state.meal}
            />
          </Col>
        </Row>
      </Container>
    ) : (
      'Loading'
    )
  }
}
