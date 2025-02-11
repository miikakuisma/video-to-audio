import React, { useRef, useState, useEffect } from "react";
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

function FileDrop(props) {
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef(null);

  const handleDrag = (e) => {
    e.dataTransfer.dropEffect = "copy";
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
      if (props.onDragIn) props.onDragIn();
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (props.onDragOut) props.onDragOut();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (props.onDrop) props.onDrop(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const element = dropRef.current;
    if (element) {
      element.addEventListener("dragenter", handleDragIn);
      element.addEventListener("dragleave", handleDragOut);
      element.addEventListener("dragover", handleDrag);
      element.addEventListener("drop", handleDrop);

      return () => {
        element.removeEventListener("dragenter", handleDragIn);
        element.removeEventListener("dragleave", handleDragOut);
        element.removeEventListener("dragover", handleDrag);
        element.removeEventListener("drop", handleDrop);
      };
    }
  }, [handleDrag, handleDragIn, handleDragOut, handleDrop]);

  return (
    <div
      className={props.className}
      ref={dropRef}
      style={{
        ...defaultProps.style,
        ...props.style
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

FileDrop.propTypes = propTypes;
FileDrop.defaultProps = defaultProps;

export default FileDrop;
