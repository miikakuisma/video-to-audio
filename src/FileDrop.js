import React, { Component } from "react";
import PropTypes from "prop-types";

const propTypes = {
  onDrop: PropTypes.func,
  onDragIn: PropTypes.func,
  onDragOut: PropTypes.func,
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string
};

const defaultProps = {
  className: "drop-area"
};

class FileDrop extends Component {
  state = {
    dragging: false
  };

  dropRef = React.createRef();

  handleDrag = (e) => {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
    e.stopPropagation();
  };

  handleDragIn = (e) => {
    const { onDragIn } = this.props;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true });
      if (onDragIn) onDragIn();
    }
  };

  handleDragOut = (e) => {
    const { onDragOut } = this.props;
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: false });
    if (onDragOut) onDragOut();
  };

  handleDrop = (e) => {
    const { onDrop } = this.props;
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: false });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onDrop) onDrop(e.dataTransfer.files);
    }
  };

  componentDidMount() {
    let element = this.dropRef.current;
    element.addEventListener("dragenter", this.handleDragIn);
    element.addEventListener("dragleave", this.handleDragOut);
    element.addEventListener("dragover", this.handleDrag);
    element.addEventListener("drop", this.handleDrop);
  }

  componentWillUnmount() {
    let element = this.dropRef.current;
    element.removeEventListener("dragenter", this.handleDragIn);
    element.removeEventListener("dragleave", this.handleDragOut);
    element.removeEventListener("dragover", this.handleDrag);
    element.removeEventListener("drop", this.handleDrop);
  }

  render() {
    return (
      <div
        className={this.props.className}
        ref={this.dropRef}
        style={{
          ...defaultProps.style,
          ...this.props.style
        }}
        onClick={() => {
          if (this.props.onClick) {
            this.props.onClick();
          }
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

FileDrop.propTypes = propTypes;
FileDrop.defaultProps = defaultProps;
export default FileDrop;
