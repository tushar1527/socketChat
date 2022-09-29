/* eslint-disable no-restricted-globals */
import React, { Component } from "react";
import { Button, TextField, Grid, Typography } from "@mui/material";

import { CopyToClipboard } from "react-copy-to-clipboard";

class UserPage extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      me: "",
    };
    this.setCustomerIdHandler = this.setCustomerId.bind(this);
  }
  setCustomerId() {
    this.setState({ me: this.state.name });
    localStorage.setItem("me", this.state.name);
  }
  render() {
    return (
      <>
        <h1>class</h1>
        <form noValidate autoComplete="off">
          <Grid container>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="h6">
                Account info
              </Typography>
              <TextField
                label="Name"
                value={this.state.name}
                fullWidth
                onChange={(e) => this.setState({ name: e.target.value })}
              />
              <CopyToClipboard text={this.me}>
                <Button
                  variant="container"
                  color="primary"
                  fullWidth
                  onClick={this.setCustomerIdHandler}
                >
                  copy your Id
                </Button>
              </CopyToClipboard>
            </Grid>
          </Grid>
        </form>
      </>
    );
  }
}

export default UserPage;
