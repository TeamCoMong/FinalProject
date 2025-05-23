package com.app.postcode;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ListView;
import com.app.R;

import java.util.ArrayList;

public class PCodeResultDialog extends Dialog {

    private Context mContext = null;

    private ListView lvResult = null;
    private ArrayList<PostCode.PostCodeVO> alPostCodeVO = null;


    public PCodeResultDialog(Context context, ArrayList<PostCode.PostCodeVO> alPostCodeVO) {
        super(context);
        mContext = context;
        this.alPostCodeVO = alPostCodeVO;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // TODO Auto-generated method stub
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // 다이얼로그 외부 화면 흐리게 표현
        WindowManager.LayoutParams lpWindow = new WindowManager.LayoutParams();
        lpWindow.flags = WindowManager.LayoutParams.FLAG_DIM_BEHIND;
        lpWindow.dimAmount = 0.8f;
        getWindow().setAttributes(lpWindow);

        setContentView(R.layout.dialog_pcode_result);

        lvResult = (ListView) findViewById(R.id.lvResult);
        lvResult.setAdapter(new PCodeResultAdapter(mContext, alPostCodeVO));
    }


}
