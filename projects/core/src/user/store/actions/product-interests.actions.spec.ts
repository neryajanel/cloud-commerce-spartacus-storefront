import {
  PRODUCT_INTERESTS,
  REMOVE_PRODUCT_INTERESTS_PROCESS_ID,
} from '../user-state';
import { UserActions } from './index';
import {
  loadMeta,
  failMeta,
  successMeta,
  resetMeta,
} from '../../../state/utils/loader/loader.action';
import { NotificationType } from '../../../model/product-interest.model';
import {
  entityLoadMeta,
  entitySuccessMeta,
  entityFailMeta,
} from '../../../state/utils/entity-loader/entity-loader.action';
import { PROCESS_FEATURE } from '../../../process/store/process-state';

const userId = 'qingyu@sap.com';
const productCode = '343898';

fdescribe('Product Interests Actions', () => {
  describe('LoadProductInterests Actions', () => {
    it('should be able to create the action', () => {
      const payload = {
        userId: userId,
        pageSize: 1,
        currentPage: 0,
        sort: 'name:asc',
        productCode: productCode,
        notificationType: NotificationType.BACK_IN_STOCK,
      };
      const action = new UserActions.LoadProductInterests(payload);
      expect({ ...action }).toEqual({
        type: UserActions.LOAD_PRODUCT_INTERESTS,
        payload: payload,
        meta: loadMeta(PRODUCT_INTERESTS),
      });
    });
  });
  describe('LoadProductInterestsFail Actions', () => {
    it('should be able to create the action', () => {
      const error = 'error';
      const action = new UserActions.LoadProductInterestsFail(error);
      expect({ ...action }).toEqual({
        type: UserActions.LOAD_PRODUCT_INTERESTS_FAIL,
        payload: error,
        meta: failMeta(PRODUCT_INTERESTS, error),
      });
    });
  });

  describe('LoadProductInterestsSuccess Actions', () => {
    it('should be able to create the action', () => {
      const payload = {
        results: [],
        sorts: [],
        pagination: {},
      };
      const action = new UserActions.LoadProductInterestsSuccess(payload);
      expect({ ...action }).toEqual({
        type: UserActions.LOAD_PRODUCT_INTERESTS_SUCCESS,
        payload: payload,
        meta: successMeta(PRODUCT_INTERESTS),
      });
    });
  });

  describe('RemoveProductInterests Actions', () => {
    it('should be able to create the action', () => {
      const payload = {
        userId: userId,
        item: {},
      };
      const action = new UserActions.RemoveProductInterests(payload);
      expect({ ...action }).toEqual({
        type: UserActions.REMOVE_PRODUCT_INTERESTS,
        payload: payload,
        meta: entityLoadMeta(
          PROCESS_FEATURE,
          REMOVE_PRODUCT_INTERESTS_PROCESS_ID
        ),
      });
    });
  });

  describe('RemoveProductInterestsSuccess Actions', () => {
    it('should be able to create the action', () => {
      const payload = 'remove success';
      const action = new UserActions.RemoveProductInterestsSuccess(payload);
      expect({ ...action }).toEqual({
        type: UserActions.REMOVE_PRODUCT_INTERESTS_SUCCESS,
        payload: payload,
        meta: entitySuccessMeta(
          PROCESS_FEATURE,
          REMOVE_PRODUCT_INTERESTS_PROCESS_ID
        ),
      });
    });
  });

  describe('RemoveProductInterestsFail Actions', () => {
    it('should be able to create the action', () => {
      const error = 'remove fail';
      const action = new UserActions.RemoveProductInterestsFail(error);
      expect({ ...action }).toEqual({
        type: UserActions.REMOVE_PRODUCT_INTERESTS_FAIL,
        payload: error,
        meta: entityFailMeta(
          PROCESS_FEATURE,
          REMOVE_PRODUCT_INTERESTS_PROCESS_ID,
          error
        ),
      });
    });
  });

  describe('ClearProductInterests Actions', () => {
    it('should be able to create the action', () => {
      const action = new UserActions.ClearProductInterests();
      expect({ ...action }).toEqual({
        type: UserActions.CLEAR_PRODUCT_INTERESTS,
        meta: resetMeta(PRODUCT_INTERESTS),
      });
    });
  });
});
