import React from 'react'
import { Form, FormGroup, FormControl, ControlLabel, InputGroup, Button, Alert } from 'react-bootstrap'
import { Icon } from 'antd'
import { Link, Redirect } from 'react-router-dom'

import './PhoneLogin.css'

class PhoneLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      code: '',
      countdown: 0,
      isCounting: false,
      error: '',
      phoneValid: true,
      codeValid: true
    }
    this.handlePhoneChange = this.handlePhoneChange.bind(this)
    this.handleCodeChange = this.handleCodeChange.bind(this)
    this.handleSendCode = this.handleSendCode.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validatePhone = this.validatePhone.bind(this)
    this.validateCode = this.validateCode.bind(this)
  }

  // 验证手机号格式
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  // 验证验证码格式
  validateCode(code) {
    const codeRegex = /^\d{6}$/
    return codeRegex.test(code)
  }

  // 手机号输入变化
  handlePhoneChange(e) {
    const phone = e.target.value
    this.setState({
      phone,
      phoneValid: this.validatePhone(phone)
    })
  }

  // 验证码输入变化
  handleCodeChange(e) {
    const code = e.target.value
    this.setState({
      code,
      codeValid: this.validateCode(code)
    })
  }

  // 发送验证码
  handleSendCode() {
    const { phone, isCounting, phoneValid } = this.state
    
    if (!phoneValid) {
      this.setState({
        error: '请输入正确的手机号'
      })
      return
    }
    
    if (isCounting) return
    
    // 发送验证码请求
    console.log('发送验证码到手机号:', phone)
    
    // 预留接口位置
    fetch('/api/send-sms-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }).then(res => {
      if (res.ok) {
        res.json().then(data => {
          // 启动倒计时
          let countdown = 60
          this.setState({
            isCounting: true,
            countdown,
            error: ''
          })
          
          const timer = setInterval(() => {
            countdown--
            if (countdown <= 0) {
              clearInterval(timer)
              this.setState({
                isCounting: false,
                countdown: 0
              })
            } else {
              this.setState({
                countdown
              })
            }
          }, 1000)
        })
      } else {
        res.json().then(data => {
          this.setState({
            error: data.message || '发送验证码失败'
          })
        })
      }
    }).catch(err => {
      this.setState({
        error: '网络错误，请稍后重试'
      })
    })
  }

  // 提交登录
  handleSubmit(e) {
    e.preventDefault()
    
    const { phone, code, phoneValid, codeValid } = this.state
    
    if (!phoneValid) {
      this.setState({
        error: '请输入正确的手机号'
      })
      return
    }
    
    if (!codeValid) {
      this.setState({
        error: '请输入6位数字验证码'
      })
      return
    }
    
    // 提交登录请求
    console.log('提交登录请求:', { phone, code })
    
    // 预留接口位置
    fetch('/api/phone-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
      credentials: 'include'
    }).then(res => {
      if (res.ok) {
        res.json().then(user => {
          this.props.login(user)
        })
      } else {
        res.json().then(data => {
          this.setState({
            error: data.message || '登录失败'
          })
        })
      }
    }).catch(err => {
      this.setState({
        error: '网络错误，请稍后重试'
      })
    })
  }

  render() {
    let { isLogined } = this.props
    let { from } = this.props.location.state || { from: { pathname: '/' } }
    
    if (isLogined) {
      return (
        <Redirect to={from} />
      )
    }
    
    const { phone, code, countdown, isCounting, error, phoneValid, codeValid } = this.state
    
    return (
      <div className="phone-login">
        <div className="phone-login-box center-block pa-center" style={{ width: 360 }}>
          <div className="phone-login-content" style={{ padding: 40, border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <div className="title" style={{ width: '100%', fontSize: 18, marginBottom: 24, textAlign: 'center', borderBottom: '1px solid #d8d8d8' }}>
              手机验证码登录
            </div>
            
            {error && (
              <Alert bsStyle="danger" style={{ marginBottom: 20 }}>
                {error}
              </Alert>
            )}
            
            <Form onSubmit={this.handleSubmit}>
              <FormGroup controlId="phone" validationState={phoneValid ? null : 'error'}>
                <ControlLabel className="sr-only">手机号</ControlLabel>
                <InputGroup>
                  <InputGroup.Addon style={{ padding: '6px 8px' }}>
                    <Icon type="mobile" style={{ fontSize: 20 }} />
                  </InputGroup.Addon>
                  <FormControl
                    type="tel"
                    name="phone"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={this.handlePhoneChange}
                    maxLength={11}
                  />
                </InputGroup>
                {!phoneValid && (
                  <ControlLabel className="text-danger">请输入正确的手机号</ControlLabel>
                )}
              </FormGroup>
              
              <FormGroup controlId="code" validationState={codeValid ? null : 'error'}>
                <ControlLabel className="sr-only">验证码</ControlLabel>
                <InputGroup>
                  <InputGroup.Addon style={{ padding: '6px 8px' }}>
                    <Icon type="code-o" style={{ fontSize: 20 }} />
                  </InputGroup.Addon>
                  <FormControl
                    type="text"
                    name="code"
                    placeholder="请输入验证码"
                    value={code}
                    onChange={this.handleCodeChange}
                    maxLength={6}
                  />
                  <InputGroup.Button>
                    <Button
                      onClick={this.handleSendCode}
                      disabled={isCounting || !phone}
                      style={{ width: 120 }}
                    >
                      {isCounting ? `${countdown}秒后重新获取` : '获取验证码'}
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
                {!codeValid && (
                  <ControlLabel className="text-danger">请输入6位数字验证码</ControlLabel>
                )}
              </FormGroup>
              
              <Button className="btn btn-primary login-btn" type="submit" style={{ display: 'block', width: '100%' }}>
                登&nbsp;录
              </Button>
            </Form>
            
            <div className="password-login-link" style={{ marginTop: 20, textAlign: 'center' }}>
              <Link to={{ 
                pathname: '/signin', 
                state: { from: this.props.location.state || { from: { pathname: '/' } } } 
              }}>
                <Icon type="lock" /> 密码登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PhoneLogin