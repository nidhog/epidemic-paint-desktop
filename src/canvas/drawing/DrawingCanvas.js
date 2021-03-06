import React from 'react';

import FlatButton from "material-ui/FlatButton";
import Paper from "material-ui/Paper";
import Subheader from "material-ui/Subheader";
import {BottomNavigation, BottomNavigationItem} from "material-ui/BottomNavigation";

import PhotoIcon from 'material-ui/svg-icons/image/photo';
import FilterSIcon from 'material-ui/svg-icons/image/filter-1';
import FilterMIcon from 'material-ui/svg-icons/image/filter-2';
import FilterLIcon from 'material-ui/svg-icons/image/filter-3';
import ColorPicker from 'material-ui-color-picker';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Undo from 'material-ui/svg-icons/content/undo';
import Redo from 'material-ui/svg-icons/content/redo';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import BrushIcon from 'material-ui/svg-icons/image/brush';

const defaultParams = {
    color: '#0f0f0f',
    size: 1,
}

const styles = {
    colorPicker: {
    },
    drawingCanvas: {
        cursor: "url('..\/public\/img\/brush.svg')",
        border: '1px solid',

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

const api_urls = {
    actionsUrl : 'http://webcanva.herokuapp.com/canvas/api/v1/actions/',
    actionSetUrl : 'http://webcanva.herokuapp.com/canvas/api/v1/get_actions',
    updateUrl: function (sessionID) {
        return 'http://webcanva.herokuapp.com/canvas/api/v1/sessions/'+
            sessionID+
            '/set_image/';
    },
    refreshUrl: function (sessionID) {
        return 'http://webcanva.herokuapp.com/canvas/api/v1/sessions/'+
            sessionID+'/';
    },
}

class DrawingCanvas extends React.Component{
    propTypes:{
        //noinspection JSAnnotator
        width: React.PropTypes.integer.isRequired,
        height: React.PropTypes.integer.isRequired
    }

    constructor(props){
        super(props);

        this.context = null;
        this.top = null;
        this.left = null;
        this.stroke = null;
        this.startPoint = [];
        this.drawingPast= new Array();
        this.drawingFuture= new Array();
        this.currentDrawing = null;


        this.state = {
            pending: false,
            initialContext: null,
            mounted: false,
            toExecute: null,
            lastCreatedAction: '',
            drawingPast: new Array,
            drawingFuture: new Array,
            cursorSizeIndex: this.sizeToIndex(this.size),
            cursor: {
                color: 'black',
                size: 'small',
            },
            mouseLocation : [0, 0],
            backgroundImage: {
                image: new Image(),
                file: '',
                imageUrl: ''
            },
        }
    }

    // Handle Initial Rendering
    initializeCanvasPosition(canvas) {
        const {top, left} = canvas.getBoundingClientRect();
        this.top = top;
        this.left = left;
        this.color = defaultParams.color;
        this.size = defaultParams.size;
    }

    initializeCanvasContext(canvas) {
        this.context = canvas.getContext('2d');
        this.setState({initialContext: this.context})
    }

    initializeCanvasDetails(canvas){
        this.initializeCanvasContext(canvas);
        this.initializeCanvasPosition(canvas);
    }

    componentDidMount(){
        this.initializeCanvasDetails(this.refs.canvas);
        this.setState({mounted: true});
        this.addPast();
    }

    // Handle Image Upload
    _handleImageInsert(e) {
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

        this.addPast();
    }

    // Handle Refreshing The Page
    newBackground(event, som){
    }


    saveToLocalStorage() {
        localStorage.setItem('canvas', this.refs.canvas.toDataURL('image/png'));
    }

    // Handle Drawing Strokes
    onDraw(e){

        if(this.context.canvas == null){
            this.componentDidMount();
        }
    }

    isOkDrawing(e){
        return this.stroke !== null;
    }

    beginDrawing({color, size}){
        this.stroke = {color, size};
    }

    endDrawing(){
        this.stroke = null;
        // TODO add to history
        // push past
        this.addPast();


    }

    getMousePosition(e){
        return {
            x: e.clientX - this.left,
            y: e.clientY - this.top
        }
    }

    draw(start, end, stroke) {
        let context = this.state.initialContext;
        context.lineJoin = 'round';
        context.linePath = 'round';
        context.lineWidth = stroke.size;
        context.strokeStyle = stroke.color;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.closePath();
        context.stroke();
    }

    trackMouseMovement(e) {
        if (this.isOkDrawing()) {
            let {x, y} = this.getMousePosition(e);
            this.draw(this.startPoint, {x, y}, this.stroke);
            this._storeAction(this.startPoint, {x, y}, 'line');
            this.startPoint = {x, y};
        }
    }

    onMouseDown(e){
        let {x, y} = this.getMousePosition(e);

        this.beginDrawing({
            color: this.color,
            size: this.size
        });
        this.startPoint = {x, y};
    }

    onMouseUp(e){
        this.endDrawing();

    }

    onMouseMove(e){
        if (this.mouseIsOut) {
            // check if left button held
            if (e.buttons == 1) {
                this.startPoint = this.getMousePosition(e);
            }
            else {
                this.endDrawing();
            }
            // no need to check onMouseEnter
            this.mouseIsOut = false;
        }
        this.trackMouseMovement(e);
        this._refreshSession();
    }

    executeBufferedActions(){
        const currentBuffer = this.state.toExecute;
        if(!this.state.executing && currentBuffer!==null && currentBuffer.length>1){
            const bufferLength = currentBuffer.length;
            for(var i = 0; i<bufferLength; i++){
                var currentAction = currentBuffer[i];
                switch(currentAction.type) {
                    case 'line':
                        this.draw(
                            {x: currentAction.startX, y: currentAction.startY},
                            {x:currentAction.endX, y:currentAction.endY},
                            {color: currentAction.color, size: currentAction.size}
                        );
                    case 'undo':
                        break;
                    case 'redo':
                        break;
                    default:
                        break;
                }


            }
        }
    }
    onMouseEnter(e){
        this.startPoint = this.getMousePosition(e);
    }

    _refreshSession(){
        if(!this.state.pending){
            this._getActionSet();
            this.executeBufferedActions();
        }
    }

    onMouseOut(e){
        this.mouseIsOut = true;
        this.trackMouseMovement(e);


    }

    // Handle ToolBar

    selectSize(size){
        this.setState({
            cursorSizeIndex: this.sizeToIndex(size)
        });
        this.size = size;
    }
    sizeToIndex(){
        switch(this.size) {
        case 10:
            return 2;
            break;
        case 3:
            return 1;
            break;
        case 1:
            return 0;
            break;
        default:
            return 0;
    }
    }
    selectColor(color){
        this.color = color;
    }

    goBckDrawing(){
        const pastDrawing = this.drawingPast.pop();
        this.drawingFuture.unshift(this.currentDrawing);
        this.currentDrawing = pastDrawing;
        // draw current
        var image = new Image();
        image.src = pastDrawing;
        this.clearCanvas();
        this.context.drawImage(image, 0, 0);
        console.log('PS')
        console.log(pastDrawing)
    }


    goFwdDrawing(){
        const futureDrawing = this.drawingFuture.shift();
        this.drawingPast.push(this.currentDrawing);
        this.currentDrawing = futureDrawing;

        // draw current
        var image = new Image();
        image.src = futureDrawing;
        this.clearCanvas();
        this.context.drawImage(image, 0, 0);
        console.log('FUT')
        console.log(futureDrawing)

    }

    // Handle Undo Redo History
    onUndo(e){
        if(this.drawingPast.length>0){
            this.goBckDrawing();
        }
        else{
            console.log('No past drawing');
        }

    }
    onRedo(e){
        if(this.drawingFuture.length>0){
            this.goFwdDrawing();
        }
        else{
            console.log('No future drawing');
        }

    }


    clearCanvas() {
        if (this.context) {
            this.context.clearRect(0, 0, this.props.width, this.props.height);
        }
    }

    updateCurrentDrawing(){
        var currentDrawing = document.getElementById('drawing-canvas').toDataURL()
        this.currentDrawing = currentDrawing;
    }

    addPast(){
        if(this.currentDrawing !== null){
            this.drawingPast.push(this.currentDrawing);
            this.drawingFuture = new Array();
        }
        this.updateCurrentDrawing();
    }


    _getActionSet(type='line'){
        const sessionID = this.props.sessionID;
        const actionSetUrl = api_urls.actionSetUrl;
        const artistID = this.props.artistID;
        const lastCreated = this.state.lastCreatedAction;


        if(sessionID !== null && sessionID !== 'null' && artistID!== null && artistID !== 'null'){
            this.setState({pending:true});
            fetch(
                actionSetUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: type,
                        last_created: lastCreated,
                        session: sessionID,
                        artist: artistID,
                    })
                }).then( (json) => {
                if(json.status == 200 || json.status == 201 ){
                    return json.json();
                }
                else{
                    console.log('failed to get actions')
                };

            }).then( (json) => {
                var actionArray = json.result;
                var newCreatedDate = actionArray[actionArray.length-1].created;
                this.setState({
                    toExecute: actionArray,
                    lastCreatedAction: newCreatedDate,
                    pending:false,
                })
            }).catch( (ex) => {
                console.log('get actions failed', ex)
            })
        }
    }

    _storeAction(startPos, endPos, type='line', updateActionDate=true){
        const sessionID = this.props.sessionID;
        const actionUrl = api_urls.actionsUrl;
        const artistID = this.props.artistID;
        const startX = startPos.x
        const startY = startPos.y;
        const endX = endPos.x;
        const endY = endPos.y;
        var color = this.stroke.color;
        var size = this.stroke.size;

        if(this.stroke!==null){
            color = this.stroke.color;
            size = this.stroke.size;
        }

        if(sessionID !== null && sessionID !== 'null' && artistID!== null && artistID!=='null'){
            fetch(
                actionUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: type,
                        session: sessionID,
                        artist: artistID,
                        startX: startX,
                        startY: startY,
                        endX: endX,
                        endY: endY,
                        color: color,
                        size: size,
                    })
                }).then( (json) => {
                if(json.status == 200 || json.status == 201 ){
                    return json.json();


                }
                else{
                    console.log('update status failed')
                };

            }).then( (json) => {
                this.setState({
                    lastCreatedAction: json.created,
                })
            }).catch( (ex) => {
                console.log('update failed', ex)
            })
        }else{
            console.log('no update offline mode')
        }
    }

    // Handle Online Session
    _updateImage(image){
        const sessionID = this.props.sessionID;
        const updateUrl = api_urls.updateUrl(sessionID);
        const artistID = this.props.artistID;
        if(sessionID !== null){
            fetch(
                updateUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: this.state.name,
                        artist: artistID,
                        image: image,
                    })
                }).then( (json) => {
                if(json.status == 200 || json.status == 201 ){
                    return json.json();

                }
                else{
                    console.log('update status failed')
                };

            }).then( (json) => {
                console.log(json)
            }).catch( (ex) => {
                console.log('update failed', ex)
            })
        }else{
            console.log('no update offline mode')
        }

    }

    refreshImageFromResponse(imageSrc){
        var image = new Image();
        image.src = imageSrc;


        if(this.context.canvas == null){
            this.componentDidMount();
        }
        this.context.drawImage(image, 0, 0);
    }

    _refreshImage(){
        const sessionID = this.props.sessionID;
        if(sessionID !== null){
            const refreshUrl = api_urls.refreshUrl(sessionID);
            const artistID = this.props.artistID;
            fetch(
                refreshUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                }).then( (json) => {
                if(json.status == 200 || json.status == 201 ){
                    return json.json();

                }
                else{
                    console.error('refresh failed')
                };

            }).then( (json) => {
                var imageSrc = this.context.canvas.toDataURL(json.image);
                this.refreshImageFromResponse(imageSrc);
            }).catch( (ex) => {
                console.log('update failed', ex)
            })
        }else{
            console.log('no update offline mode')
        }

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
                <Paper
                    zDepth={1}
                    id='color-picker' style={styles.colorPicker}>

                </Paper>

                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <Subheader >Color</Subheader>
                        <ColorPicker
                            defaultValue={defaultParams.color}
                            onChange={color => this.selectColor(color)}
                        />
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <IconMenu
                            iconButtonElement={
                                <IconButton touch={true} onClick={this.onUndo.bind(this)}>
                                    <Undo />
                                </IconButton>
                            }
                        >
                        </IconMenu>
                        <IconMenu
                            iconButtonElement={
                                <IconButton touch={true} onClick={this.onRedo.bind(this)}>
                                    <Redo />
                                </IconButton>
                            }
                        >
                        </IconMenu>
                    </ToolbarGroup>
                </Toolbar>

                <canvas id='drawing-canvas'
                        ref="canvas"
                        style={styles.drawingCanvas}
                        width={this.props.width} height={this.props.height}
                        onClick={this.onDraw.bind(this)}
                        onMouseDown={this.onMouseDown.bind(this)}
                        onMouseUp={this.onMouseUp.bind(this)}
                        onMouseMove={this.onMouseMove.bind(this)}
                        onMouseOut={this.onMouseOut.bind(this)}
                        onMouseEnter={this.onMouseEnter.bind(this)}
                >
                </canvas>

                <Paper
                    zDepth={1}
                    id='size-picker'>
                    <Subheader>Select Brush Size</Subheader>
                    <BottomNavigation selectedIndex={this.sizeToIndex()}>
                        <BottomNavigationItem
                            label="Small"
                            icon={<FilterSIcon iconStyle={styles} />}
                            onClick={this.selectSize.bind(this, 1)}
                        />
                        <BottomNavigationItem
                            label="Medium"
                            icon={<FilterMIcon />}

                            onClick={this.selectSize.bind(this, 3)}
                        />
                        <BottomNavigationItem
                            label="Large"
                            icon={<FilterLIcon />}
                            onClick={this.selectSize.bind(this, 10)}
                        />
                    </BottomNavigation>

                </Paper>
                <FlatButton
                    id='image-upload'
                    label="Insert Image"
                    labelPosition="before"
                    style={styles.outerButton}
                    containerElement="label"
                    icon={<PhotoIcon />}
                >
                    <input type="file" style={styles.innerAction} onChange={(e)=>this._handleImageInsert(e)} draggable="true"/>
                </FlatButton>


            </div>
        );
    }

};

export default DrawingCanvas;
