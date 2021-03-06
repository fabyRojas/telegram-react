/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getChatLetters } from '../../Utils/Chat';
import { loadChatContent } from '../../Utils/File';
import ChatStore from '../../Stores/ChatStore';
import FileStore from '../../Stores/FileStore';
import './ChatTileControl.css';

class ChatTileControl extends Component{
    constructor(props){
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.chatId !== this.props.chatId){
            return true;
        }

        return false;
    }

    componentDidMount(){
        ChatStore.on('clientUpdateFastUpdatingComplete', this.onFastUpdatingComplete);
        FileStore.on('clientUpdateChatBlob', this.onClientUpdateChatBlob);
        ChatStore.on('updateChatPhoto', this.onUpdateChatPhoto);
        ChatStore.on('updateChatTitle', this.onUpdateChatTitle);
    }

    componentWillUnmount(){
        ChatStore.removeListener('clientUpdateFastUpdatingComplete', this.onFastUpdatingComplete);
        FileStore.removeListener('clientUpdateChatBlob', this.onClientUpdateChatBlob);
        ChatStore.removeListener('updateChatPhoto', this.onUpdateChatPhoto);
        ChatStore.removeListener('updateChatTitle', this.onUpdateChatTitle);
    }

    onFastUpdatingComplete = (update) => {
        this.forceUpdate();
    };

    onClientUpdateChatBlob = (update) => {
        const { chatId } = this.props;

        if (chatId === update.chatId){
            this.forceUpdate();
        }
    };

    onUpdateChatPhoto = (update) => {
        const { chatId } = this.props;

        if (!update.chat_id) return;
        if (update.chat_id !== chatId) return;

        const chat = ChatStore.get(chatId);
        if (!update.photo){
            this.forceUpdate();
        }
    };

    onUpdateChatTitle = (update) => {
        const { chatId } = this.props;

        if (!update.chat_id) return;
        if (update.chat_id !== chatId) return;

        const chat = ChatStore.get(chatId);
        if (!update.photo){
            this.forceUpdate();
        }
        else{
            loadChatContent(chat)
        }
    };

    handleSelect = (event) => {
        event.stopPropagation();

        const { chatId, onSelect } = this.props;
        if (!onSelect) return;

        onSelect(chatId);
    };

    render(){
        const { chatId, onSelect } = this.props;

        const chat = ChatStore.get(chatId);
        if (!chat) return null;

        const { photo } = chat;

        const letters = getChatLetters(chat);
        const blob = photo && photo.small?
            FileStore.getBlob(photo.small.id) :
            null;

        let src;
        try{
            src = FileStore.getBlobUrl(blob);
        }
        catch(error){
            console.log(`[ChatTileControl] render chat_id=${chat.id} with error ${error}`);
        }

        const tileColor = `tile_color_${(Math.abs(chatId) % 8 + 1)}`;
        const className = classNames(
            'tile-photo',
            {[tileColor]: !blob},
            {pointer: onSelect}
        );

        return src ?
            (<img className={className} src={src} draggable={false} alt='' onClick={this.handleSelect}/>) :
            (<div className={className} onClick={this.handleSelect}><span className='tile-text'>{letters}</span></div>);
    }
}

ChatTileControl.propTypes = {
    chatId: PropTypes.number.isRequired,
    onSelect: PropTypes.func
};

export default ChatTileControl;