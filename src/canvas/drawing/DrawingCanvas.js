import React from 'react';

import FlatButton from "material-ui/FlatButton";
import PhotoIcon from 'material-ui/svg-icons/image/photo';

const styles = {
    drawingCanvas: {
        cursor: "url('..\/public\/img\/brush.svg')",
    },
    outerButton: {
        verticalAlign: 'middle',
    },
    innerAction: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
    },
};

class DrawingCanvas extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            cursor: {
                color: 'black',
                size: 'small',
            },
            mouseLocation : [0, 0],
            backgroundImage: {
                image: new Image(),
                file: '',
                imageUrl: ''
            }
        }
    }

    _handleImageChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = () => {
            var imageUrl = reader.result;

            var image = new Image();

            image.src = imageUrl;

            this.setState(
                {backgroundImage:
                    {
                        image: image,
                        file: file,
                        imageUrl: imageUrl
                    }}
            );


            if(this.context.canvas == null){
                this.componentDidMount();
            }
            this.context.drawImage(image,
                this.props.width / 2 - image.width / 2,
                this.props.height / 2 - image.height / 2)
        }

        reader.readAsDataURL(file);
    }

    onDraw(e){

        this.context.fillStyle = this.state.cursor.color;
        this.context.fillRect(0,0, this.props.width, this.props.height);
    }

    newBackground(event, som){
        console.log(event);
        console.log(som);
    }

    componentDidMount(){
        this.context = this.refs.canvas.getContext('2d');
    }



    saveToLocalStorage() {
        localStorage.setItem('canvas', this.refs.canvas.toDataURL('image/png'));
    }

    render() {
        let {imageUrl} = this.state.backgroundImage;
        let $imageUrl = null;
        if (imageUrl) {
            $imageUrl = (<img src={imageUrl} />);
        } else {
            $imageUrl = (<div className="previewText">Please select an Image for Preview</div>);
        }

        return (
            <div id="drawing-container">
                <canvas id="drawing-canvas"
                        ref="canvas"
                        style={styles.drawingCanvas}
                        width={this.props.width} height={this.props.height}
                        onClick={this.onDraw.bind(this)}>
                </canvas>

                <FlatButton
                    label="Background Image"
                    labelPosition="before"
                    style={styles.outerButton}
                    containerElement="label"
                    icon={<PhotoIcon />}
                >
                    <input type="file" style={styles.innerAction} onChange={(e)=>this._handleImageChange(e)} />
                </FlatButton>
            </div>
        );
    }

};

export default DrawingCanvas;
