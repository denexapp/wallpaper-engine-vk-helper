import { TextField } from '@material-ui/core';
import React from 'react';
import useTypedMessage from '../../hooks/useTypedMessage';
import { useTypedDispatch, useTypedSelector } from '../../redux';
import { setDescription } from '../../redux/reducers/post';
import Documents from '../Documents';
import Subheader from '../Subheader';
import TypedMessage from '../TypedMessage';
import styles from './styles.module.css';

const Post: React.FC = () => {
  const dispatch = useTypedDispatch();

  const description = useTypedSelector((state) => state.post.description);
  const onDescriptionChange = (value: string) =>
    dispatch(setDescription(value));
  const descriptionLabel = useTypedMessage({ id: 'postDescriptionLabel' });

  return (
    <div className={styles.post}>
      <Subheader>
        <TypedMessage id="postHeader" />
      </Subheader>
      <Documents />
      <TextField
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        label={descriptionLabel}
        variant="outlined"
        multiline
      />
    </div>
  );
};

export default Post;
